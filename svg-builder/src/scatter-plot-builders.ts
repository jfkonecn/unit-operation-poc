import { type Selection } from "d3-selection";
import * as d3 from "d3";
import * as fs from "node:fs";
import { getPathToSvg } from "./utils.ts";
import * as ss from "simple-statistics";
// https://d3-graph-gallery.com/graph/scatter_basic.html

type DrawScatterPlotArgs<T> = {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  fileName: string;
  mapToPoint: (x: T) => { x: number; y: number };
  totalHeight?: number;
  totalWidth?: number;
  xDomain: [number, number];
  yDomain: [number, number];
};

export function drawScatterPlot<T>({
  svg,
  fileName,
  mapToPoint,
  totalHeight = 400,
  totalWidth = 460,
  yDomain,
  xDomain,
}: DrawScatterPlotArgs<T>) {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const csvData = fs.readFileSync(getPathToSvg(fileName), "utf8");
  const data = d3.csvParse(csvData).map((x) => mapToPoint(x as T));

  const g = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Add X axis
  const x = d3.scaleLinear().domain(xDomain).range([0, width]);
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear().domain(yDomain).range([height, 0]);
  g.append("g").call(d3.axisLeft(y));

  // Add dots
  g.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .attr("r", 1.5)
    .style("fill", "currentColor");

  // add trend line
  const regression = ss.linearRegression(data.map(({ x, y }) => [x, y]));
  const line = ss.linearRegressionLine(regression);

  const lineData = x.domain().map(function (x) {
    return {
      x,
      y: line(x),
    };
  });
  const dAttrGenerator = d3
    .line<(typeof lineData)[0]>()
    .x((d) => x(d.x))
    .y((d) => y(d.y));

  g.append("path")
    .attr("d", dAttrGenerator(lineData))
    .attr("class", "reg")
    .style("stroke-dasharray", "3, 3")
    .attr("stroke", "red")
    .attr("stroke-width", 1);
}
