import { select } from "d3";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "node:path";
import * as consts from "./consts.ts";
import { type Selection } from "d3-selection";
// https://gist.github.com/denisemauldin/977dc65d13acf24f7b86bbf2d14eb384
// https://heroicons.com/
// https://www.sarasoueidan.com/blog/svg-coordinate-systems/

type CreateSvgBuilderArgs = {
  height?: number;
  width?: number;
};

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

type AddSvgItemArgs = {
  height: number;
  width: number;
  x: number;
  y: number;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  label: string;
};

export function addMap({
  height,
  width,
  x,
  y,
  svg: parentSvg,
  label,
}: AddSvgItemArgs) {
  const svg = createChildSvg({ parentSvg, x, y, width, height });

  const { centerSvg } = drawSingleOutputArrow({
    svg,
    label,
  });

  centerSvg
    .append("path")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("d", [
      "M 0 6",
      "H 18",
      "M 0 18",
      "H 18",
      "M 12 0",
      "L 24 12",
      "M 12 24",
      "L 24 12",
    ]);
}

export function addFilter({
  height,
  width,
  x,
  y,
  svg: parentSvg,
  label,
}: AddSvgItemArgs) {
  const svg = createChildSvg({ parentSvg, x, y, width, height });

  const defs = svg.append("defs");

  const fillPatternId = "fill";
  defs
    .append("pattern")
    .attr("id", fillPatternId)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("patternTransform", "rotate(45 0 0)")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .append("line")
    .style("stroke", "currentColor")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", 10);
  drawSingleOutputArrow({
    svg,
    label,
    fill: `url(#${fillPatternId})`,
  });
}

export function addSort({
  height,
  width,
  x,
  y,
  svg: parentSvg,
  label,
}: AddSvgItemArgs) {
  const svg = createChildSvg({ parentSvg, x, y, width, height });

  const { centerSvg } = drawSingleOutputArrow({
    svg,
    label,
  });

  centerSvg
    .append("path")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("d", [
      "M3",
      "7.5",
      "7.5",
      "3m0",
      "0L12",
      "7.5M7.5",
      "3v13.5m13.5",
      "0L16.5",
      "21m0",
      "0L12",
      "16.5m4.5",
      "4.5V7.5",
    ]);
}

type CreateChildSvgArgs = {
  parentSvg: Selection<SVGSVGElement, unknown, null, undefined>;
  x: number;
  y: number;
  width: number;
  height: number;
};

function createChildSvg({
  parentSvg,
  x,
  y,
  width,
  height,
}: CreateChildSvgArgs) {
  return parentSvg
    .append("svg")
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height);
}

type DrawSingleOutputArrowArgs = {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  fill?: string;
  label: string;
};
type DrawSingleOutputArrowRtn = {
  centerSvg: Selection<SVGSVGElement, unknown, null, undefined>;
};

function drawSingleOutputArrow({
  svg: parentSvg,
  label,
  fill = "transparent",
}: DrawSingleOutputArrowArgs): DrawSingleOutputArrowRtn {
  const width = 200;
  const height = 100;
  const triangleSize = width * 0.25;
  const svg = parentSvg
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("x", 0)
    .attr("y", 0);

  const outerPoints: { x: number; y: number }[] = [
    { x: 0, y: 0 },
    { x: width - triangleSize, y: 0 },
    { x: width, y: height / 2 },
    { x: width - triangleSize, y: height },
    { x: 0, y: height },
    { x: triangleSize, y: height / 2 },
    { x: 0, y: 0 },
  ];
  svg
    .append("polyline")
    .style("fill", fill)
    .attr("stroke", "currentColor")
    .attr("stroke-width", 1.5)
    .attr("points", outerPoints.map(({ x, y }) => `${x},${y}`).join(","));
  svg
    .append("text")
    .attr("stroke", "currentColor")
    .attr("x", triangleSize)
    .attr("y", "1rem")
    .text(() => label);
  const centerSvg = svg
    .append("svg")
    .attr("height", height / 2)
    .attr("width", width / 2)
    .attr("x", width / 4)
    .attr("y", height / 4)
    .attr("viewBox", [0, 0, 24, 24])
    .attr("stroke-width", 1.5)
    .attr("stroke", "currentColor");
  return { centerSvg };
}
