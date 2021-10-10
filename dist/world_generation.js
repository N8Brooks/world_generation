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
class Theme {
    colorBands;
    constructor(...colorBands1){
        this.colorBands = colorBands1;
    }
    get heightToColor() {
        this.colorBands.sort((a, b)=>a.upperBound - b.upperBound
        );
        const heightToColor = Array(this.length);
        let lowerBound = 0;
        for (const { upperBound , rgbColor  } of this.colorBands){
            const color = Theme.rgbToColor(rgbColor);
            heightToColor.fill(color, lowerBound, upperBound + 1);
            lowerBound = upperBound;
        }
        return heightToColor;
    }
    get length() {
        return Math.max(-1, ...this.colorBands.map((band)=>band.upperBound
        )) + 1;
    }
    static rgbToColor([r, g, b]) {
        return r + (g << 8) + (b << 16) + (255 << 24);
    }
}
const Themes = {
    atlas: new Theme({
        upperBound: 40,
        rgbColor: [
            138,
            180,
            248
        ]
    }, {
        upperBound: 48,
        rgbColor: [
            187,
            226,
            198
        ]
    }, {
        upperBound: 50,
        rgbColor: [
            168,
            218,
            181
        ]
    }, {
        upperBound: 58,
        rgbColor: [
            251,
            248,
            243
        ]
    }, {
        upperBound: 61,
        rgbColor: [
            245,
            240,
            228
        ]
    }, {
        upperBound: 64,
        rgbColor: [
            148,
            210,
            165
        ]
    }, {
        upperBound: 66,
        rgbColor: [
            136,
            193,
            152
        ]
    }, {
        upperBound: 75,
        rgbColor: [
            178,
            207,
            189
        ]
    }, {
        upperBound: 78,
        rgbColor: [
            164,
            191,
            174
        ]
    }, {
        upperBound: 80,
        rgbColor: [
            233,
            233,
            233
        ]
    }, {
        upperBound: 100,
        rgbColor: [
            255,
            255,
            255
        ]
    }),
    pixel: new Theme({
        upperBound: 26,
        rgbColor: [
            1,
            49,
            99
        ]
    }, {
        upperBound: 30,
        rgbColor: [
            0,
            62,
            125
        ]
    }, {
        upperBound: 34,
        rgbColor: [
            0,
            70,
            139
        ]
    }, {
        upperBound: 38,
        rgbColor: [
            1,
            84,
            168
        ]
    }, {
        upperBound: 42,
        rgbColor: [
            0,
            94,
            189
        ]
    }, {
        upperBound: 45,
        rgbColor: [
            0,
            106,
            212
        ]
    }, {
        upperBound: 50,
        rgbColor: [
            1,
            118,
            237
        ]
    }, {
        upperBound: 53,
        rgbColor: [
            237,
            195,
            154
        ]
    }, {
        upperBound: 56,
        rgbColor: [
            43,
            144,
            0
        ]
    }, {
        upperBound: 58,
        rgbColor: [
            36,
            128,
            47
        ]
    }, {
        upperBound: 64,
        rgbColor: [
            22,
            89,
            32
        ]
    }, {
        upperBound: 70,
        rgbColor: [
            122,
            122,
            122
        ]
    }, {
        upperBound: 75,
        rgbColor: [
            143,
            143,
            143
        ]
    }, {
        upperBound: 80,
        rgbColor: [
            204,
            204,
            204
        ]
    }, {
        upperBound: 100,
        rgbColor: [
            255,
            255,
            255
        ]
    })
};
const Shapes = {
    square (centerX, centerY) {
        const maximumDistance = Math.min(centerX, centerY);
        return function(x, y) {
            const distanceX = Math.abs(x - centerX);
            const distanceY = Math.abs(y - centerY);
            const minimumDistance = Math.max(distanceX, distanceY);
            return Math.min(1, minimumDistance / maximumDistance);
        };
    },
    circle (centerX, centerY) {
        const maximumDistance = Math.min(centerX, centerY);
        return function(x, y) {
            const distanceX = x - centerX;
            const distanceY = y - centerY;
            const distance = Math.hypot(distanceX, distanceY);
            return Math.min(1, distance / maximumDistance);
        };
    },
    flat (_centerX, _centerY) {
        return function(_x, _y) {
            return 0.5;
        };
    }
};
const ROWS = 3;
const COLS = 4;
const NUM_WORKERS = navigator.hardwareConcurrency || 2;
const defaultOptions = {
    pixels: 1,
    theme: "pixel",
    shape: "circle",
    simplex: {
        frequency: 0.002,
        octaves: 5,
        persistance: 0.5,
        seed: NaN
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
        this.options = {
            ...defaultOptions,
            ...this.urlOptions,
            ...options1
        };
        this.render();
    }
    render() {
        const { pixels , theme , shape: name , simplex: { ...simplex } ,  } = this.options;
        const shape = {
            name,
            xCenter: Math.floor(this.width / 2),
            yCenter: Math.floor(this.height / 2)
        };
        if (isNaN(simplex.seed)) {
            simplex.seed = Math.floor(Math.random() * MAX_32_BIT_INTEGER);
        }
        const promises = this.tiles.map((tile)=>this.pool.addWork({
                pixels,
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
    get urlOptions() {
        const options = {
        };
        const url = new URL(window.location.toString());
        const theme = url.searchParams.get("theme") ?? "";
        if (theme in Themes) {
            options.theme = theme;
        }
        const shape = url.searchParams.get("shape") ?? "";
        if (shape in Shapes) {
            options.shape = shape;
        }
        options.simplex = {
            ...defaultOptions.simplex
        };
        for (const key of Object.keys(options.simplex)){
            const value = parseFloat(url.searchParams.get(key) ?? "");
            if (!isNaN(value)) {
                options.simplex[key] = value;
            }
        }
        const pixels = parseFloat(url.searchParams.get("pixels") ?? "");
        if (!isNaN(pixels)) {
            options.pixels = pixels;
        }
        return options;
    }
}
customElements.define("world-generation", WorldGeneration1);
export { WorldGeneration1 as WorldGeneration };
