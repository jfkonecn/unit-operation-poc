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
  const { centerSvg } = drawUnitOperator({
    svg,
    label,
    x,
    y,
    height,
    returns: "simple",
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
  drawUnitOperator({
    svg,
    label,
    x,
    y,
    height,
    fill: `url(#${fillPatternId})`,
    returns: "simple",
  });
}

export function addSort({ height, x, y, svg, label }: AddSvgItemArgs) {
  const { centerSvg } = drawUnitOperator({
    svg,
    label,
    x,
    y,
    height,
    returns: "simple",
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

export function addValidate({ height, x, y, svg, label }: AddSvgItemArgs) {
  const { centerSvg } = drawUnitOperator({
    svg,
    label,
    x,
    y,
    height,
    returns: "result",
  });

  centerSvg
    .attr("fill", "none")
    .append("path")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("d", [
      "M12",
      "9v3.75m-9.303",
      "3.376c-.866",
      "1.5.217",
      "3.374",
      "1.948",
      "3.374h14.71c1.73",
      "0",
      "2.813-1.874",
      "1.948-3.374L13.949",
      "3.378c-.866-1.5-3.032-1.5-3.898",
      "0L2.697",
      "16.126ZM12",
      "15.75h.007v.008H12v-.008Z",
    ]);
}

type DrawSingleOutputArrowArgs = {
  fill?: string;
  returns: "simple" | "result";
} & AddSvgItemArgs;
type DrawSingleOutputArrowRtn = {
  centerSvg: Selection<SVGSVGElement, unknown, null, undefined>;
};

function drawUnitOperator({
  svg: parentSvg,
  x: absX,
  y: absY,
  height: absHeight,
  label,
  fill = "transparent",
  returns,
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
  const outlineXOffset = 10;
  const outlineYOffset = 10;

  type OuterPoint = { x: number; y: number };
  const outerPointReturns: OuterPoint[] =
    returns === "result"
      ? [
          {
            x: outlineViewBoxWidth - outlineXOffset,
            y: outlineViewBoxHeight / 3,
          },
          {
            x: outlineViewBoxWidth - triangleSize - outlineXOffset,
            y: outlineViewBoxHeight / 2,
          },
          {
            x: outlineViewBoxWidth - outlineXOffset,
            y: (outlineViewBoxHeight * 2) / 3,
          },
        ]
      : [
          {
            x: outlineViewBoxWidth - outlineXOffset,
            y: outlineViewBoxHeight / 2,
          },
        ];

  const outerPoints: OuterPoint[] = [
    { x: outlineXOffset, y: outlineYOffset },
    {
      x: outlineViewBoxWidth - triangleSize - outlineXOffset,
      y: outlineYOffset,
    },
    ...outerPointReturns,
    {
      x: outlineViewBoxWidth - triangleSize - outlineXOffset,
      y: outlineViewBoxHeight - outlineYOffset,
    },
    { x: outlineXOffset, y: outlineViewBoxHeight - outlineYOffset },
    { x: triangleSize + outlineXOffset, y: outlineViewBoxHeight / 2 },
  ];
  const outerLineSvg = svg
    .append("svg")
    .attr("width", outerViewBoxWidth)
    .attr("viewBox", [0, 0, outlineViewBoxWidth, outlineViewBoxHeight]);

  outerLineSvg
    .append("polygon")
    .attr("stroke-linejoin", "round")
    .style("fill", fill)
    .attr("stroke", "currentColor")
    .attr("stroke-width", 4)
    .attr(
      "points",
      outerPoints.map(({ x, y }) => `${x},${y}`),
    );

  outerLineSvg
    .append("line")
    .attr("stroke", "currentColor")
    .attr("stroke-width", 4)
    .attr("x1", 0)
    .attr("y1", outlineViewBoxHeight / 2)
    .attr("x2", triangleSize + outlineXOffset)
    .attr("y2", outlineViewBoxHeight / 2);

  if (returns === "result") {
    outerLineSvg
      .append("line")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 4)
      .attr("x1", outlineViewBoxWidth - outlineXOffset)
      .attr("y1", outlineViewBoxHeight / 3)
      .attr("x2", outerViewBoxWidth)
      .attr("y2", outlineViewBoxHeight / 3);
    outerLineSvg
      .append("line")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 4)
      .attr("x1", outlineViewBoxWidth - outlineXOffset)
      .attr("y1", (outlineViewBoxHeight * 2) / 3)
      .attr("x2", outerViewBoxWidth)
      .attr("y2", (outlineViewBoxHeight * 2) / 3);
  } else {
    outerLineSvg
      .append("line")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 4)
      .attr("x1", outlineViewBoxWidth - outlineXOffset)
      .attr("y1", outlineViewBoxHeight / 2)
      .attr("x2", outerViewBoxWidth)
      .attr("y2", outlineViewBoxHeight / 2);
  }

  svg
    .append("text")
    .attr("stroke", "currentColor")
    .attr("x", 0)
    .attr("y", "1rem")
    .attr("font-size", "1rem")
    .text(() => label);
  const centerSvg = svg
    .append("svg")
    .attr("height", outerViewBoxHeight / 2 - outlineYOffset * 2)
    .attr("width", outerViewBoxWidth / 2 - outlineXOffset * 2)
    .attr("x", outerViewBoxWidth / 4 + outlineXOffset)
    .attr("y", outerViewBoxHeight / 4 + outlineYOffset)
    .attr("viewBox", [0, 0, 24, 24])
    .attr("stroke-width", 1.5)
    .attr("stroke", "currentColor");
  return { centerSvg };
}
