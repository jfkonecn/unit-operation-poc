import { type Selection } from "d3-selection";
import * as d3 from "d3";
import * as fs from "node:fs";
import { getPathToSvg } from "./utils.ts";
// https://d3-graph-gallery.com/graph/scatter_basic.html

type DrawScatterPlotArgs = {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  fileName: string;
};

export function drawScatterPlot({ svg, fileName }: DrawScatterPlotArgs) {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const csvData = fs.readFileSync(getPathToSvg(fileName), "utf8");
  const data = d3.csvParse(csvData);

  const g = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Add X axis
  const x = d3.scaleLinear().domain([0, 4000]).range([0, width]);
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 500000]).range([height, 0]);
  g.append("g").call(d3.axisLeft(y));

  // Add dots
  g.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d.GrLivArea);
    })
    .attr("cy", function (d) {
      return y(d.SalePrice);
    })
    .attr("r", 1.5)
    .style("fill", "currentColor");
}
