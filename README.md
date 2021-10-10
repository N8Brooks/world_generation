# WorldGeneration

Simplex world generation built with the JavaScript canvas API and Web Workers
API.

## Demo:

### Pixel theme

https://n8brooks.github.io/world_generation/dist/index.html

### Atlas theme

https://n8brooks.github.io/world_generation/dist/index.html?theme=atlas&shape=square

### Other options:

- theme: "atlas" | "pixel"
- shape: "circle" | "square" | "flat"
- seed: integer
- octaves: integer
- frequency: float
- persistance: float

## Build Commands:

deno bundle src/world_generation.ts dist/world_generation.js -c deno.json

deno bundle src/worker.ts dist/worker.js -c deno.json
