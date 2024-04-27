import { select } from "d3";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "node:path";
import * as consts from "./consts.ts";
import { type Selection } from "d3-selection";

interface CreateSvgBuilderArgs {
  height?: number;
  width?: number;
}

export function createSvgBuilder({
  height = 100,
  width = 100,
}: CreateSvgBuilderArgs = {}): {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  saveToFile: (fileName: string) => void;
} {
  const dom = new JSDOM(`<body></body>`);

  const body = select(dom.window.document.querySelector("body"));
  const svg = body
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("xmlns", "http://www.w3.org/2000/svg");

  return {
    svg,
    saveToFile: (fileName: string) => {
      fs.writeFileSync(path.join(consts.pathToSvg, fileName), body.html());
    },
  };
}

interface AddSvgItemArgs {
  height: number;
  width: number;
  x: number;
  y: number;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
}

export function addMap({ height, width, x, y, svg }: AddSvgItemArgs) {
  svg
    .append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)
    .style("fill", "green");
  svg
    .append("polyline")
    .style("stroke", "black")
    .style("fill", "red")
    .attr("points", "10,10,15,10,15,30,30,30");
}
