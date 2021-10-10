# WorldGeneration

Simplex world generation built with the JavaScript Canvas API and Web Workers
API.

## Demo:

### Atlas theme

https://n8brooks.github.io/world_generation/dist/index.html?theme=atlas&shape=square

### Pixel-ey theme

https://n8brooks.github.io/world_generation/dist/index.html?pixels=10

### Other options:

- theme: "pixel" | "atlas" (default is "pixel")
- shape: "circle" | "square" | "flat" (default is "circle")
- seed: integer (default is Math.random() * 2**32)
- octaves: integer (default is 5)
- frequency: float (default is 0.002)
- persistance: float (default is 0.5)

## Build Commands:

deno bundle src/world_generation.ts dist/world_generation.js -c deno.json

deno bundle src/worker.ts dist/worker.js -c deno.json
