import { Tile } from "./Tile.ts";
import { Shapes } from "./Shapes.ts";
import { Themes } from "./Themes.ts";

/** Settings for simplex noise. */
export type SimplexOptions = {
  seed: number;
  frequency: number;
  octaves: number;
  persistance: number;
};

/** Shape type for land with the coordinates of the center of the island. */
export type ShapeOptions = {
  name: keyof typeof Shapes;
  xCenter: number;
  yCenter: number;
};

/** Type of `data` object that a worker receives from main. */
export type WorkerMessageData = {
  tile: Tile;
  simplex: SimplexOptions;
  theme: keyof typeof Themes;
  shape: ShapeOptions;
};

/** Type of `data` object that main receives from workers. */
export type MainMessageData = {
  tile: Tile;
  imageData: ImageData;
};

/** Worker resolve function signature. */
export type Resolve = (value: MainMessageData) => void;

/** Worker reject function signature. */
export type Reject = (reason: Event) => void;

/** Type of work given to `WorkerPool`. */
export type Work = [WorkerMessageData, Resolve, Reject];

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

  _workerDone(worker: Worker, error?: Event, data?: MainMessageData) {
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

  addWork(data: WorkerMessageData): Promise<MainMessageData> {
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
