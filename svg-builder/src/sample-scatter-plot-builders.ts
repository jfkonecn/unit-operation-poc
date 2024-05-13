import { drawScatterPlot } from "./scatter-plot-builders.ts";
import { createSvgBuilder } from "./unit-operator-builders.ts";

function renderScatterPlotSvg(label: string) {
  const { svg, saveToFile } = createSvgBuilder();
  drawScatterPlot(svg)
    .then(() => {
      saveToFile(`scatter-plots/${label}.svg`);
    })
    .catch(console.error);
}

export function buildSimplePlot() {
  renderScatterPlotSvg("simple-plot");
}
