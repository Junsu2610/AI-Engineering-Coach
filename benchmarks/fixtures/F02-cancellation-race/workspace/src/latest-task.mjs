export function createLatestTaskRunner(applyResult) {
  let generation = 0;

  return {
    async start(task) {
      const requestGeneration = ++generation;
      const result = await task();
      applyResult(result);
      return { applied: requestGeneration === generation, result };
    },
    cancel() {
      generation += 1;
    },
  };
}
