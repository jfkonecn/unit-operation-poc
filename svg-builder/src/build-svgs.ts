import { addMap, createSvgBuilder } from "./utils.ts";

const { svg, saveToFile } = createSvgBuilder();
addMap({
  height: 100,
  width: 100,
  x: 10,
  y: 10,
  svg,
});
saveToFile("out.svg");
