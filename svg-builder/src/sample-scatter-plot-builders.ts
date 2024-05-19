import { drawScatterPlot } from "./scatter-plot-builders.ts";
import { createSvgBuilder } from "./unit-operator-builders.ts";

type DrawScatterPlotArgs<T> = Parameters<typeof drawScatterPlot<T>>[0];
type RenderScatterPlotSvgArgs<T> = { label: string } & Pick<
  DrawScatterPlotArgs<T>,
  | "mapToPoint"
  | "xDomain"
  | "yDomain"
  | "totalHeight"
  | "totalWidth"
  | "baseDir"
>;
function renderScatterPlotSvg<T>({
  label,
  baseDir,
  mapToPoint,
  totalWidth,
  totalHeight,
  xDomain,
  yDomain,
}: RenderScatterPlotSvgArgs<T>) {
  const { svg, saveToFile } = createSvgBuilder();
  drawScatterPlot<T>({
    svg,
    label,
    mapToPoint,
    totalWidth,
    totalHeight,
    xDomain,
    yDomain,
    baseDir,
  });
  saveToFile(`scatter-plots/${baseDir}/${label}.svg`);
}

export function buildSimplePlot() {
  renderScatterPlotSvg<{ GrLivArea: string; SalePrice: string }>({
    label: "simple-plot",
    mapToPoint: (x) => ({ x: +x.GrLivArea, y: +x.SalePrice }),
    xDomain: [0, 4000],
    yDomain: [0, 500_000],
    baseDir: "simple-plot",
  });
}

function renderPerformancePlotSvgs(functionName: string) {
  renderScatterPlotSvg<{ GrLivArea: string; SalePrice: string }>({
    label: `${functionName}_runtime`,
    mapToPoint: (x) => ({ x: +x.GrLivArea, y: +x.SalePrice }),
    xDomain: [0, 4000],
    yDomain: [0, 500_000],
    baseDir: functionName,
  });
  renderScatterPlotSvg<{ GrLivArea: string; SalePrice: string }>({
    label: `${functionName}_memory`,
    mapToPoint: (x) => ({ x: +x.GrLivArea, y: +x.SalePrice }),
    xDomain: [0, 4000],
    yDomain: [0, 500_000],
    baseDir: functionName,
  });
}

// trace_and_profile(query_all_and_map)
// trace_and_profile(get_one_row_at_a_time)
// trace_and_profile(in_memory_join)

export function buildQueryAllAndMap() {
  renderPerformancePlotSvgs("query_all_and_map");
}
