import { drawScatterPlot } from "./scatter-plot-builders.ts";
import { createSvgBuilder } from "./unit-operator-builders.ts";

type DrawScatterPlotArgs<T> = Parameters<typeof drawScatterPlot<T>>[0];
type RenderScatterPlotSvgArgs<T> = { label: string } & Pick<
  DrawScatterPlotArgs<T>,
  "mapToPoint" | "xDomain" | "yDomain" | "totalHeight" | "totalWidth"
>;
function renderScatterPlotSvg<T>({
  label,
  mapToPoint,
  totalWidth,
  totalHeight,
  xDomain,
  yDomain,
}: RenderScatterPlotSvgArgs<T>) {
  const { svg, saveToFile } = createSvgBuilder();
  drawScatterPlot<T>({
    svg,
    fileName: `scatter-plots/${label}.csv`,
    mapToPoint,
    totalWidth,
    totalHeight,
    xDomain,
    yDomain,
  });
  saveToFile(`scatter-plots/${label}.svg`);
}

export function buildSimplePlot() {
  renderScatterPlotSvg<{ GrLivArea: number; SalePrice: number }>({
    label: "simple-plot",
    mapToPoint: (x) => ({ x: x.GrLivArea, y: x.SalePrice }),
    xDomain: [0, 4000],
    yDomain: [0, 500_000],
  });
}
