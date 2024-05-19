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
  renderScatterPlotSvg<{ pageSize: string; totalRunTime: string }>({
    label: `${functionName}_runtime`,
    mapToPoint: (x) => ({ x: +x.pageSize, y: +x.totalRunTime }),
    xDomain: [0, 4000],
    yDomain: [0, 500_000],
    baseDir: functionName,
  });
  renderScatterPlotSvg<{ pageSize: string; memoryAllocations: string }>({
    label: `${functionName}_memory`,
    mapToPoint: (x) => ({ x: +x.pageSize, y: +x.memoryAllocations }),
    xDomain: [0, 4000],
    yDomain: [0, 500_000],
    baseDir: functionName,
  });
}

export function buildQueryAllAndMap() {
  renderPerformancePlotSvgs("query_all_and_map");
}

export function buildGetOneRowAtATime() {
  renderPerformancePlotSvgs("get_one_row_at_a_time");
}

export function buildInMemoryJoin() {
  renderPerformancePlotSvgs("in_memory_join");
}
