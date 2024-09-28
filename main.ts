import { Plugin } from "obsidian";

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

      // Once the script is loaded, render the graph
      script.onload = () => {
        const board = (window as any).JXG.JSXGraph.initBoard(container, {
          boundingbox: [-5, 5, 5, -5],
          axis: true
        });

        // Create the function dynamically, injecting 'board' as the context
        try {
          // Directly execute the source as JS inside a function context
          // We use eval here for simplicity, but caution should be taken in production
          const graphCode = new Function("board", source);
          graphCode(board); // Execute the JSXGraph code from the markdown block
        } catch (e) {
          console.error("Error in JSXGraph code:", e);
          const errorDiv = document.createElement("div");
          errorDiv.textContent = `Error in JSXGraph code: ${e.message}`;
          el.appendChild(errorDiv);
        }
      };
    });
  }

  onunload() {
    console.log("JSXGraph Plugin unloaded!");
  }
}