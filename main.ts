import { Plugin } from "obsidian";

// Helper function to parse options and commands from the markdown block
function parseOptionsAndCommands(source: string) {
  const lines = source.split("\n");
  const configLine = lines[0].trim();

  let ggbAppletOptions = {
    "appName": "graphing", // Default app type, can be changed
    "width": 800,
    "height": 600,
    "showToolBar": false,
    "showAlgebraInput": false,
    "showMenuBar": false,
    "enableShiftDragZoom": true,
    "enableRightClick": false,
    "capturingThreshold": null
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

  return { ggbAppletOptions, commands: source.trim() };
}

export default class GeoGebraPlugin extends Plugin {
  async onload() {
    console.log("GeoGebra Plugin loaded!");

    // Register a markdown code block processor for 'geogebra'
    this.registerMarkdownCodeBlockProcessor("geogebra", (source, el, ctx) => {
      const { ggbAppletOptions, commands } = parseOptionsAndCommands(source);

      // Create a div for rendering the GeoGebra applet
      const container = document.createElement("div");
      container.id = "ggbApplet";
      container.style.width = `${ggbAppletOptions.width}px`;
      container.style.height = `${ggbAppletOptions.height}px`;
      el.appendChild(container);

      // Load GeoGebra API
      const script = document.createElement("script");
      script.src = "https://www.geogebra.org/apps/deployggb.js";
      script.charset = "UTF-8";
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize the GeoGebra applet with the user-defined options
        const applet = new (window as any).GGBApplet(ggbAppletOptions, true);
        applet.inject(container.id);

        // Apply custom commands after the applet loads
        applet.registerClientListener(() => {
          if (commands) {
            const commandList = commands.split("\n").filter(cmd => cmd.trim() !== "");
            commandList.forEach((command: string) => {
              applet.evalCommand(command);
            });
          }
        });
      };
    });
  }

  onunload() {
    console.log("GeoGebra Plugin unloaded!");
  }
}