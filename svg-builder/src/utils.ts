import { select } from "d3";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "node:path";
import * as consts from "./consts.ts";
import { type Selection } from "d3-selection";
// https://gist.github.com/denisemauldin/977dc65d13acf24f7b86bbf2d14eb384

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
  stroke?: string;
  debug?: boolean;
};

export function addMap({
  height,
  width,
  x,
  y,
  svg,
  stroke = "black",
  debug = false,
  label,
}: AddSvgItemArgs) {
  if (debug) {
    const leftX = x - width / 2;
    const rightX = leftX + width;
    const topY = y - height / 2;
    const bottomY = topY + height;
    svg
      .append("rect")
      .attr("x", leftX)
      .attr("y", topY)
      .attr("width", width)
      .attr("stroke", "red")
      .attr("fill", "transparent")
      .attr("height", height);

    svg
      .append("line")
      .style("stroke", "red")
      .attr("x1", leftX)
      .attr("x2", rightX)
      .attr("y1", topY)
      .attr("y2", bottomY);

    svg
      .append("line")
      .style("stroke", "red")
      .attr("x1", leftX)
      .attr("x2", rightX)
      .attr("y1", bottomY)
      .attr("y2", topY);
  }

  const { triangleSize } = drawSingleOutputArrow({
    width,
    y,
    height,
    x,
    svg,
    stroke,
    label,
  });

  const innerTopY = y - (height / 2) * 0.5;
  const innerBottomY = y + (height / 2) * 0.5;
  const innerLeftX = x - (width / 2) * 0.5;
  const innerRightX = x + (width / 2) * 0.5;

  if (debug) {
    svg
      .append("rect")
      .attr("x", innerLeftX)
      .attr("y", innerTopY)
      .attr("width", innerRightX - innerLeftX)
      .attr("stroke", "red")
      .attr("fill", "transparent")
      .attr("height", innerBottomY - innerTopY);
  }

  svg
    .append("line")
    .style("stroke", stroke)
    .attr("x1", innerLeftX)
    .attr("x2", innerRightX - triangleSize)
    .attr("y1", (innerTopY - y) * 0.5 + y)
    .attr("y2", (innerTopY - y) * 0.5 + y);

  svg
    .append("line")
    .style("stroke", stroke)
    .attr("x1", innerLeftX)
    .attr("x2", innerRightX - triangleSize)
    .attr("y1", (innerBottomY - y) * 0.5 + y)
    .attr("y2", (innerBottomY - y) * 0.5 + y);

  const innerPoints: { x: number; y: number }[] = [
    { x: innerRightX - triangleSize, y: innerTopY },
    { x: innerRightX, y },
    { x: innerRightX - triangleSize, y: innerBottomY },
  ];
  svg
    .append("polyline")
    .style("stroke", stroke)
    .style("fill", "transparent")
    .attr("points", innerPoints.map(({ x, y }) => `${x},${y}`).join(","));
}

export function addFilter({
  height,
  width,
  x,
  y,
  svg,
  stroke = "black",
  debug = false,
  label,
}: AddSvgItemArgs) {
  if (debug) {
    const leftX = x - width / 2;
    const rightX = leftX + width;
    const topY = y - height / 2;
    const bottomY = topY + height;
    svg
      .append("rect")
      .attr("x", leftX)
      .attr("y", topY)
      .attr("width", width)
      .attr("stroke", "red")
      .attr("fill", "transparent")
      .attr("height", height);

    svg
      .append("line")
      .style("stroke", "red")
      .attr("x1", leftX)
      .attr("x2", rightX)
      .attr("y1", topY)
      .attr("y2", bottomY);

    svg
      .append("line")
      .style("stroke", "red")
      .attr("x1", leftX)
      .attr("x2", rightX)
      .attr("y1", bottomY)
      .attr("y2", topY);
  }

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
    .style("stroke", stroke)
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", 10);
  drawSingleOutputArrow({
    width,
    y,
    height,
    x,
    svg,
    stroke,
    label,
    fill: `url(#${fillPatternId})`,
  });
}

type DrawSingleOutputArrowArgs = {
  width: number;
  y: number;
  height: number;
  x: number;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  stroke: string;
  fill?: string;
  label: string;
};
type DrawSingleOutputArrowRtn = {
  triangleSize: number;
};
function drawSingleOutputArrow({
  width,
  y,
  height,
  x,
  svg,
  stroke,
  label,
  fill = "transparent",
}: DrawSingleOutputArrowArgs): DrawSingleOutputArrowRtn {
  const triangleSize = width * 0.25;
  const topY = y - (height / 2) * 0.9;
  const bottomY = y + (height / 2) * 0.9;
  const leftX = x - width / 2;
  const rightX = x + width / 2;
  const outerPoints: { x: number; y: number }[] = [
    { x: leftX, y: topY },
    { x: rightX - triangleSize, y: topY },
    { x: rightX, y },
    { x: rightX - triangleSize, y: bottomY },
    { x: leftX, y: bottomY },
    { x: leftX + triangleSize, y },
    { x: leftX, y: topY },
  ];
  svg
    .append("polyline")
    .style("stroke", stroke)
    .style("fill", fill)
    .attr("points", outerPoints.map(({ x, y }) => `${x},${y}`).join(","));
  svg
    .append("text")
    .style("stroke", stroke)
    .attr("x", x - width / 2)
    .attr("y", y - height / 2)
    .text(() => label);
  return { triangleSize };
}
