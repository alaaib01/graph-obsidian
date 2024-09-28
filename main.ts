import { Plugin } from "obsidian";

// Helper function to parse options from the markdown block
function parseOptions(source: string) {
  const lines = source.split("\n");
  const configLine = lines[0].trim();

  let ggbAppletOptions = {
    id: "ggbApplet",
    width: 800,
    height: 600,
    showToolBar: false,
    showMenuBar: false,
    showAlgebraInput: false,
    showResetIcon: true,
    enableLabelDrags: false,
    enableShiftDragZoom: true,
    useBrowserForJS: false,
    appletOnLoad: () => {}
  };

  if (configLine.startsWith("{") && configLine.endsWith("}")) {
    try {
      const config = JSON.parse(configLine);
      ggbAppletOptions = { ...ggbAppletOptions, ...config };
      // Remove the first line (the config) from the source code
      source = lines.slice(1).join("\n");
    } catch (e) {
      console.error("Invalid configuration in GeoGebra block:", e);
    }
  }

  return { ggbAppletOptions, source };
}

export default class GeoGebraPlugin extends Plugin {
  async onload() {
    console.log("GeoGebra Plugin loaded!");

    // Register a markdown code block processor for 'geogebra'
    this.registerMarkdownCodeBlockProcessor("geogebra", (source, el, ctx) => {
      const { ggbAppletOptions, source: commands } = parseOptions(source);

      // Create a div for rendering the GeoGebra applet
      const container = document.createElement("div");
      container.id = ggbAppletOptions.id;
      container.style.width = `${ggbAppletOptions.width}px`;
      container.style.height = `${ggbAppletOptions.height}px`;
      el.appendChild(container);

      // Load GeoGebra JS API from CDN
      const script = document.createElement("script");
      script.src = "https://www.geogebra.org/apps/deployggb.js";
      script.charset = "UTF-8";
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize the GeoGebra applet
        const ggbApplet = new (window as any).GGBApplet(ggbAppletOptions, true);
        ggbApplet.inject(container.id);

        // Set dark mode background and customize axes/grid colors
        ggbAppletOptions.appletOnLoad = () => {
          ggbApplet.setColor("xAxis", 255, 255, 255); // White axes
          ggbApplet.setColor("yAxis", 255, 255, 255); // White axes
          ggbApplet.setGridVisible(true);
          ggbApplet.setGridColor(200, 200, 200); // Light gray grid
          ggbApplet.setBackgroundColor(0, 0, 0); // Dark background
          ggbApplet.setCoordSystem(-10, 10, -10, 10); // Adjust coord system if needed

          const commandList = commands.split("\n").filter(cmd => cmd.trim() !== "");

          // Pass each command to the applet
          commandList.forEach(command => {
            ggbApplet.evalCommand(command);
          });
        };
      };
    });
  }

  onunload() {
    console.log("GeoGebra Plugin unloaded!");
  }
}