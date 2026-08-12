export class WorkerController {
  constructor() {
    this.queue = [];
    this.busy = false;
    this.locked = false;
  }

  async processTask(task) {
    if (this.locked) {
      throw new Error('Worker Controller Deadlock');
    }
    this.locked = true;
    try {
      this.queue.push(task);
      const result = await new Promise(resolve => setTimeout(() => resolve(task.data * 2), 10));
      return result;
    } finally {
      this.locked = false;
    }
  }
}
