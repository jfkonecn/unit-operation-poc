import { drawScatterPlot } from "./scatter-plot-builders.ts";
import { createSvgBuilder } from "./unit-operator-builders.ts";

function renderScatterPlotSvg(label: string) {
  const { svg, saveToFile } = createSvgBuilder();
  drawScatterPlot({ svg, fileName: `scatter-plots/${label}.csv` });
  saveToFile(`scatter-plots/${label}.svg`);
}

export function buildSimplePlot() {
  renderScatterPlotSvg("simple-plot");
}
