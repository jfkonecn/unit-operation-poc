import { addMap, createSvgBuilder } from "./utils.ts";

const { svg, saveToFile } = createSvgBuilder({
  height: 600,
  width: 600,
});
addMap({
  height: 100,
  width: 200,
  x: 300,
  y: 300,
  svg,
  label: "map",
});
saveToFile("unit-operations/map.svg");
