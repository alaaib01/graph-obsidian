import { Plugin } from "obsidian";

// Helper function to parse options from the markdown block
function parseOptions(source: string) {
  const lines = source.split("\n");
  const configLine = lines[0].trim();
  
  // Default bounding box
  let boundingBox = [-5, 5, 5, -5];

  // Check if the first line contains bounding box options
  if (configLine.startsWith("{") && configLine.endsWith("}")) {
    try {
      const config = JSON.parse(configLine);
      if (config.boundingBox && Array.isArray(config.boundingBox)) {
        boundingBox = config.boundingBox;
      }
    } catch (e) {
      console.error("Invalid configuration in JSXGraph block:", e);
    }
    // Remove the first line (the config) from the source code
    source = lines.slice(1).join("\n");
  }

  return { boundingBox, source };
}

export default class JSXGraphPlugin extends Plugin {
  async onload() {
    console.log("JSXGraph Plugin loaded!");

    // Register a markdown code block processor for 'jsxgraph'
    this.registerMarkdownCodeBlockProcessor("jsxgraph", (source, el, ctx) => {
      // Parse the configuration options from the block
      const { boundingBox, source: graphSource } = parseOptions(source);

      // Create a div for rendering the JSXGraph board
      const container = document.createElement("div");
      container.id = "jxgbox";
      container.style.width = "500px";
      container.style.height = "300px";
      el.appendChild(container);

      // Load JSXGraph CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css";
      document.head.appendChild(cssLink);

      // Load JSXGraph JavaScript core library
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js";
      script.charset = "UTF-8";
      document.head.appendChild(script);

      // Optionally load MathJax if required
      const mathJaxScript = document.createElement("script");
      mathJaxScript.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
      mathJaxScript.id = "MathJax-script";
      mathJaxScript.async = true;
      document.head.appendChild(mathJaxScript);

      // Once the JSXGraph script is loaded, initialize the board and evaluate the graph code
      script.onload = () => {
        const board = (window as any).JXG.JSXGraph.initBoard(container, {
          boundingbox: boundingBox, // Use the user-specified or default bounding box
          axis: true
        });

        // Create a function graph, allowing the source from the markdown to be injected
        try {
          const graphCode = new Function("board", graphSource);
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