# WorldGeneration

Simplex world generation built with the JavaScript Canvas API and Web Workers
API.

## Demo:

### Atlas theme

https://n8brooks.github.io/world_generation/dist/index.html?theme=atlas&shape=square

### Pixel-ey theme

https://n8brooks.github.io/world_generation/dist/index.html?pixels=10

### Other options:

- theme: "pixel" | "atlas"
- shape: "circle" | "square" | "flat"
- seed: integer
- octaves: integer
- frequency: float
- persistance: float

## Build Commands:

deno bundle src/world_generation.ts dist/world_generation.js -c deno.json

deno bundle src/worker.ts dist/worker.js -c deno.json
