class WorldGeneration1 extends HTMLElement {
    canvas;
    context;
    height;
    width;
    constructor(){
        super();
        const shadowRoot = this.attachShadow({
            mode: "open"
        });
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d") ?? undefined;
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        shadowRoot.append(this.canvas);
    }
}
customElements.define("world-generation", WorldGeneration1);
export { WorldGeneration1 as WorldGeneration };
