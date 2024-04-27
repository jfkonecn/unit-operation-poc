import { select } from "d3";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "node:path";
import * as consts from "./consts.ts";

const dom = new JSDOM(`<body></body>`);

const body = select(dom.window.document.querySelector("body"));
const svg = body
  .append("svg")
  .attr("width", 100)
  .attr("height", 100)
  .attr("xmlns", "http://www.w3.org/2000/svg");
svg
  .append("rect")
  .attr("x", 10)
  .attr("y", 10)
  .attr("width", 80)
  .attr("height", 80)
  .style("fill", "red");
fs.writeFileSync(path.join(consts.pathToSvg, "out.svg"), body.html());
