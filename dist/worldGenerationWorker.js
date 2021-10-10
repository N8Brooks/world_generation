const G2 = (3 - Math.sqrt(3)) / 6;
const Grad = [
    [
        1,
        1
    ],
    [
        -1,
        1
    ],
    [
        1,
        -1
    ],
    [
        -1,
        -1
    ],
    [
        1,
        0
    ],
    [
        -1,
        0
    ],
    [
        1,
        0
    ],
    [
        -1,
        0
    ],
    [
        0,
        1
    ],
    [
        0,
        -1
    ],
    [
        0,
        1
    ],
    [
        0,
        -1
    ], 
];
function makeNoise2D(random = Math.random) {
    const p = new Uint8Array(256);
    for(let i = 0; i < 256; i++)p[i] = i;
    let n;
    let q;
    for(let i1 = 255; i1 > 0; i1--){
        n = Math.floor((i1 + 1) * random());
        q = p[i1];
        p[i1] = p[n];
        p[n] = q;
    }
    const perm = new Uint8Array(512);
    const permMod12 = new Uint8Array(512);
    for(let i2 = 0; i2 < 512; i2++){
        perm[i2] = p[i2 & 255];
        permMod12[i2] = perm[i2] % 12;
    }
    return (x, y)=>{
        const s = (x + y) * 0.5 * (Math.sqrt(3) - 1);
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;
        const i1 = x0 > y0 ? 1 : 0;
        const j1 = x0 > y0 ? 0 : 1;
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;
        const ii = i & 255;
        const jj = j & 255;
        const g0 = Grad[permMod12[ii + perm[jj]]];
        const g1 = Grad[permMod12[ii + i1 + perm[jj + j1]]];
        const g2 = Grad[permMod12[ii + 1 + perm[jj + 1]]];
        const t0 = 0.5 - x0 * x0 - y0 * y0;
        const n0 = t0 < 0 ? 0 : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0);
        const t1 = 0.5 - x1 * x1 - y1 * y1;
        const n1 = t1 < 0 ? 0 : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1);
        const t2 = 0.5 - x2 * x2 - y2 * y2;
        const n2 = t2 < 0 ? 0 : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2);
        return 70.14805770653952 * (n0 + n1 + n2);
    };
}
let centerX = NaN;
let centerY = NaN;
let maximumDistance = NaN;
const Shapes = {
    square,
    circle,
    flat
};
function setDimensions([width, height]) {
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2);
    maximumDistance = Math.min(centerX, centerY);
}
function square(x, y) {
    const distanceX = Math.abs(x - centerX);
    const distanceY = Math.abs(y - centerY);
    const minimumDistance = Math.max(distanceX, distanceY);
    return Math.min(1, minimumDistance / maximumDistance);
}
function circle(x, y) {
    const distanceX = x - centerX;
    const distanceY = y - centerY;
    const distance = Math.hypot(distanceX, distanceY);
    return Math.min(1, distance / maximumDistance);
}
function flat(_x, _y) {
    return 0.5;
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
onmessage = function(message) {
    const { window , theme , seeds , rectangle: { width , height , x0 , y0  } , shape: shapeType , simplex: { frequency , octaves , persistance  } ,  } = message.data;
    let i = 0;
    const noise2D = makeNoise2D(()=>seeds[i++]
    );
    setDimensions(window);
    const shape = Shapes[shapeType];
    const totalAmplitude = 2 - 1 / 2 ** (octaves - 1);
    const imageData = new ImageData(width, height);
    const buffer = new Uint32Array(imageData.data.buffer);
    const { heightToColor  } = Themes[theme];
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            buffer[width * y + x] = ensemble(x, y);
        }
    }
    function ensemble(x, y) {
        const value = noise(x0 + x, y0 + y) - shape(x0 + x, y0 + y) + 1;
        const height = Math.floor(50 * value);
        return heightToColor[height];
    }
    function noise(x, y) {
        let result = 0, amp = 1, freq = frequency;
        for(let octave = 0; octave < octaves; octave++){
            result += amp * noise2D(x * freq, y * freq);
            amp *= persistance;
            freq *= 2;
        }
        return (1 + result / totalAmplitude) / 2;
    }
    postMessage({
        rectangle: message.data.rectangle,
        imageData
    }, [
        imageData.data.buffer
    ]);
};
