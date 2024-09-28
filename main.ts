import { Plugin } from "obsidian";

// Main plugin class
export default class JSXGraphPlugin extends Plugin {
  async onload() {
    console.log("JSXGraph Plugin loaded!");

    // Register a markdown code block processor for 'jsxgraph'
    this.registerMarkdownCodeBlockProcessor("jsxgraph", (source, el, ctx) => {
      // Create a div to render the JSXGraph board
      const container = document.createElement("div");
      container.style.width = "500px";
      container.style.height = "500px";
      el.appendChild(container);

      // Load JSXGraph script from CDN
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js";
      document.head.appendChild(script);

      // When the script is loaded, render the graph
      script.onload = () => {
        const board = (window as any).JXG.JSXGraph.initBoard(container, {
          boundingbox: [-5, 5, 5, -5],
          axis: true
        });

        // Try to evaluate the code from the markdown block
        try {
          const graphCode = new Function("board", source);
          graphCode(board);
        } catch (e) {
          console.error("Error in JSXGraph code:", e);
        }
      };
    });
  }

  onunload() {
    console.log("JSXGraph Plugin unloaded!");
  }
}