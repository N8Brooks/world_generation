import { Dimensions, Rectangle } from "./Rectangle.ts";
import { Shapes } from "./Shapes.ts";
import { Themes } from "./Themes.ts";
import { SimplexOptions } from "./WorldGenerationOptions.ts";

export type InputData = {
  rectangle: Rectangle;
  theme: keyof typeof Themes;
  shape: keyof typeof Shapes;
  simplex: SimplexOptions;
  window: Dimensions;
  seeds: number[];
};

export type OutputData = {
  rectangle: Rectangle;
  imageData: ImageData;
};

export type Resolve = (value: OutputData | PromiseLike<OutputData>) => void;

export type Reject = (reason: Event) => void;

export type Work = [InputData, Resolve, Reject];

export class WorkerPool {
  idleWorkers: Worker[] = [];
  workQueue: Work[] = [];
  workerMap: Map<Worker, [Resolve, Reject]> = new Map();

  constructor(numWorkers: number, workerSource: string) {
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(workerSource);

      worker.onmessage = (message) => {
        this._workerDone(worker, undefined, message.data);
      };

      worker.onerror = (error) => {
        this._workerDone(worker, error, undefined);
      };

      this.idleWorkers[i] = worker;
    }
  }

  _workerDone(worker: Worker, error?: Event, data?: OutputData) {
    const settlers = this.workerMap.get(worker);
    if (settlers === undefined) {
      throw Error("worker does not exist in worker map");
    }
    const [resolve, reject] = settlers;
    this.workerMap.delete(worker);

    const work = this.workQueue.shift();
    if (work === undefined) {
      this.idleWorkers.push(worker);
    } else {
      const [data, resolve, reject] = work;
      this.workerMap.set(worker, [resolve, reject]);
      worker.postMessage(data);
    }

    if (error !== undefined) {
      reject(error);
    } else if (data !== undefined) {
      resolve(data);
    }
  }

  addWork(data: InputData): Promise<OutputData> {
    return new Promise((resolve, reject) => {
      const worker = this.idleWorkers.pop();
      if (worker === undefined) {
        this.workQueue.push([data, resolve, reject]);
      } else {
        this.workerMap.set(worker, [resolve, reject]);
        worker.postMessage(data);
      }
    });
  }
}
