const MAX_32_BIT_INTEGER = 2 ** 32;
class Tile {
    x0;
    y0;
    width;
    height;
    constructor([x01, y01], [width1, height1]){
        this.x0 = x01;
        this.y0 = y01;
        this.width = width1;
        this.height = height1;
    }
    static *tessellate([rows, cols], [width, height]) {
        const columnWidth = Math.ceil(width / cols);
        const rowHeight = Math.ceil(height / rows);
        for(let row = 0; row < rows; row++){
            const tileHeight = row < rows - 1 ? rowHeight : height - rowHeight * (rows - 1);
            for(let col = 0; col < cols; col++){
                const tileWidth = col < cols - 1 ? columnWidth : width - columnWidth * (cols - 1);
                yield new Tile([
                    col * columnWidth,
                    row * rowHeight
                ], [
                    tileWidth,
                    tileHeight
                ]);
            }
        }
    }
}
class Pool {
    idleWorkers = [];
    workQueue = [];
    workerMap = new Map();
    constructor(numWorkers, workerSource){
        for(let i = 0; i < numWorkers; i++){
            const worker = new Worker(workerSource);
            worker.onmessage = (message)=>{
                this._workerDone(worker, undefined, message.data);
            };
            worker.onerror = (error)=>{
                this._workerDone(worker, error, undefined);
            };
            this.idleWorkers[i] = worker;
        }
    }
    _workerDone(worker, error, data) {
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
            this.workerMap.set(worker, [
                resolve,
                reject
            ]);
            worker.postMessage(data);
        }
        if (error !== undefined) {
            reject(error);
        } else if (data !== undefined) {
            resolve(data);
        }
    }
    addWork(data) {
        return new Promise((resolve, reject)=>{
            const worker = this.idleWorkers.pop();
            if (worker === undefined) {
                this.workQueue.push([
                    data,
                    resolve,
                    reject
                ]);
            } else {
                this.workerMap.set(worker, [
                    resolve,
                    reject
                ]);
                worker.postMessage(data);
            }
        });
    }
}
const ROWS = 3;
const COLS = 4;
const NUM_WORKERS = navigator.hardwareConcurrency || 2;
const defaultOptions = {
    theme: "pixel",
    shape: "circle",
    simplex: {
        frequency: 0.002,
        octaves: 5,
        persistance: 0.5,
        get seed () {
            return Math.floor(Math.random() * MAX_32_BIT_INTEGER);
        }
    }
};
class WorldGeneration1 extends HTMLElement {
    canvas;
    context;
    height;
    width;
    options;
    pool;
    tiles;
    constructor(options1 = {
    }){
        super();
        this.style.height = "0";
        this.style.display = "block";
        const shadowRoot = this.attachShadow({
            mode: "open"
        });
        this.canvas = document.createElement("canvas");
        const context1 = this.canvas.getContext("2d");
        if (context1 === null) {
            throw Error("canvas context identifier not supported");
        }
        this.context = context1;
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        shadowRoot.append(this.canvas);
        this.options = {
            ...defaultOptions,
            ...options1
        };
        this.tiles = [
            ...Tile.tessellate([
                ROWS,
                COLS
            ], [
                this.width,
                this.height
            ])
        ];
        this.pool = new Pool(NUM_WORKERS, "worker.js");
        this.render();
    }
    render() {
        const { theme , shape: name , simplex: { ...simplex } ,  } = this.options;
        const shape = {
            name,
            xCenter: Math.floor(this.width / 2),
            yCenter: Math.floor(this.height / 2)
        };
        const promises = this.tiles.map((tile)=>this.pool.addWork({
                tile,
                theme,
                shape,
                simplex
            })
        );
        Promise.all(promises).then((responses)=>{
            for (const { imageData , tile: { x0 , y0  }  } of responses){
                this.context.putImageData(imageData, x0, y0);
            }
        }).catch((reason)=>{
            console.error(reason);
        });
    }
}
customElements.define("world-generation", WorldGeneration1);
export { WorldGeneration1 as WorldGeneration };
