// UI-only: no tools, prompt injection, stored transcripts, or provider calls.
// Pi 0.84.2: agent_end can precede automatic recovery; agent_settled is final.
export default function runMetrics(pi, clock = {
  now: () => performance.now(),
  every: (fn) => setInterval(fn, 1000),
  cancel: (timer) => clearInterval(timer),
}) {
  let run;
  let timer;
  const key = "run-metrics";

  function stopTimer() {
    if (timer !== undefined) clock.cancel(timer);
    timer = undefined;
  }

  function render(ctx) {
    if (!ctx.hasUI || !run) return;
    const seconds = Math.max(0, ((run.end ?? clock.now()) - run.start) / 1000);
    const elapsed = seconds < 60 ? `${seconds.toFixed(1)}s`
      : `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    const rate = run.completeUsage && run.tokens > 0 && run.modelMs > 0
      ? `${(run.tokens * 1000 / run.modelMs).toFixed(1)} tok/s`
      : "n/a tok/s";
    const state = run.end === undefined ? "running" : run.reason === "aborted"
      ? "aborted" : run.reason === "error" ? "error" : "finished";
    // Rate uses finalized responses only; it remains stable during tool work.
    ctx.ui.setStatus(key, `Run ${elapsed} (${state}) | Model ${rate}`);
  }

  function reset(_event, ctx) {
    stopTimer();
    run = undefined;
    if (ctx.hasUI) ctx.ui.setStatus(key, undefined);
  }

  pi.on("session_start", reset);
  pi.on("session_tree", reset);
  pi.on("session_shutdown", reset);

  pi.on("agent_start", (_event, ctx) => {
    if (!ctx.hasUI) return;
    if (!run || run.end !== undefined) {
      stopTimer();
      run = { start: clock.now(), tokens: 0, modelMs: 0, completeUsage: true };
      timer = clock.every(() => render(ctx));
      timer?.unref?.();
    }
    render(ctx);
  });

  // message_start timing differs across providers. turn_start consistently
  // precedes request setup/first-token wait; tools from the prior turn are done.
  pi.on("turn_start", () => {
    if (run && run.end === undefined) run.turnStart = clock.now();
  });

  pi.on("message_end", (event, ctx) => {
    if (!run || run.end !== undefined || event.message.role !== "assistant") return;
    const elapsed = clock.now() - run.turnStart;
    const output = event.message.usage?.output;
    if (Number.isFinite(output) && output > 0 && Number.isFinite(elapsed) && elapsed > 0) {
      run.tokens += output;
      run.modelMs += elapsed;
    } else {
      // Zero/missing usage is common on failed or unsupported providers.
      // Never estimate tokens from characters or display misleading infinity.
      run.completeUsage = false;
    }
    run.turnStart = undefined;
    run.reason = event.message.stopReason;
    render(ctx);
  });

  pi.on("agent_settled", (_event, ctx) => {
    // Another extension may have started work in an earlier settled handler.
    if (!run || run.end !== undefined || !ctx.isIdle()) return;
    run.end = clock.now();
    stopTimer();
    render(ctx);
  });
}
