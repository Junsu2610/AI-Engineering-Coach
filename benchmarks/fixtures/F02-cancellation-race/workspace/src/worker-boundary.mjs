export async function runWorkerTask(worker, input) {
  return worker.execute(input);
}
