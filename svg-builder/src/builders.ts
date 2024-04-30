import { addFilter, addMap, createSvgBuilder } from "./utils.ts";

export function buildMapSample() {
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
}

export function buildFilterSample() {
  const { svg, saveToFile } = createSvgBuilder({
    height: 600,
    width: 600,
  });
  addFilter({
    height: 100,
    width: 200,
    x: 300,
    y: 300,
    svg,
    label: "filter",
  });
  saveToFile("unit-operations/filter.svg");
}
