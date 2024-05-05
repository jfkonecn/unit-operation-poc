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

export type AddSvgItemArgs = {
  height: number;
  x: number;
  y: number;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  label: string;
};

export function addMap({ height, x, y, svg, label }: AddSvgItemArgs) {
  const { centerSvg } = drawSingleOutputArrow({
    svg,
    label,
    x,
    y,
    height,
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

export function addFilter({ height, x, y, svg, label }: AddSvgItemArgs) {
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
    x,
    y,
    height,
    fill: `url(#${fillPatternId})`,
  });
}

export function addSort({ height, x, y, svg, label }: AddSvgItemArgs) {
  const { centerSvg } = drawSingleOutputArrow({
    svg,
    label,
    x,
    y,
    height,
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

type DrawSingleOutputArrowArgs = {
  fill?: string;
} & AddSvgItemArgs;
type DrawSingleOutputArrowRtn = {
  centerSvg: Selection<SVGSVGElement, unknown, null, undefined>;
};

function drawSingleOutputArrow({
  svg: parentSvg,
  x: absX,
  y: absY,
  height: absHeight,
  label,
  fill = "transparent",
}: DrawSingleOutputArrowArgs): DrawSingleOutputArrowRtn {
  const outerViewBoxWidth = 200;
  const outerViewBoxHeight = 150;
  const svg = parentSvg
    .append("svg")
    .attr("viewBox", [0, 0, outerViewBoxWidth, outerViewBoxHeight])
    .attr("x", absX)
    .attr("y", absY)
    .attr("height", absHeight);

  const outlineViewBoxWidth = 200;
  const outlineViewBoxHeight = 100;
  const triangleSize = outlineViewBoxWidth * 0.25;
  const outerPoints: { x: number; y: number }[] = [
    { x: 0, y: 0 },
    { x: outlineViewBoxWidth - triangleSize, y: 0 },
    { x: outlineViewBoxWidth, y: outlineViewBoxHeight / 2 },
    { x: outlineViewBoxWidth - triangleSize, y: outlineViewBoxHeight },
    { x: 0, y: outlineViewBoxHeight },
    { x: triangleSize, y: outlineViewBoxHeight / 2 },
    { x: 0, y: 0 },
  ];
  svg
    .append("svg")
    .attr("width", outerViewBoxWidth)
    .attr("viewBox", [0, 0, outlineViewBoxWidth, outlineViewBoxHeight])
    .append("polyline")
    .style("fill", fill)
    .attr("stroke", "currentColor")
    .attr("stroke-width", 4)
    .attr("points", outerPoints.map(({ x, y }) => `${x},${y}`).join(","));

  svg
    .append("text")
    .attr("stroke", "currentColor")
    .attr("x", 0)
    .attr("y", "1rem")
    .attr("font-size", "x-large")
    .text(() => label);
  const centerSvg = svg
    .append("svg")
    .attr("height", outerViewBoxHeight / 2)
    .attr("width", outerViewBoxWidth / 2)
    .attr("x", outerViewBoxWidth / 4)
    .attr("y", outerViewBoxHeight / 4)
    .attr("viewBox", [0, 0, 24, 24])
    .attr("stroke-width", 1.5)
    .attr("stroke", "currentColor");
  return { centerSvg };
}
