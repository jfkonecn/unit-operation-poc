import {
  type AddSvgItemArgs,
  addFilter,
  addMap,
  addSort,
  createSvgBuilder,
  addValidate,
  addAuthenticate,
  addAuthorize,
  addGlobalStateRead,
  addGlobalStateWrite,
  addIo,
  addPanic,
  addDistribution,
  addPassthrough,
} from "./unit-operator-builders.ts";

function renderSampleSvg(
  label: string,
  render: (args: AddSvgItemArgs) => void,
) {
  const scale = 1;
  const totalHeight = 1080 * scale;
  const totalWidth = 1920 * scale;
  const { svg, saveToFile } = createSvgBuilder({
    height: totalHeight,
    width: totalWidth,
  });

  const sampleHeight = 150 * 6 * scale;
  const sampleWidth = 200 * 6 * scale;
  const sampleX = totalWidth / 2 - sampleWidth / 2;
  const sampleY = totalHeight / 2 - sampleHeight / 2;
  const args: AddSvgItemArgs = {
    label: label.toUpperCase().replaceAll("_", " "),
    height: sampleHeight,
    width: sampleWidth,
    x: sampleX,
    y: sampleY,
    svg,
  };
  svg.attr("viewBox", [0, 0, totalWidth, totalHeight]);
  render(args);
  saveToFile(`unit-operations/${label}.svg`);
}

export function buildMapSample() {
  renderSampleSvg("map", addMap);
}

export function buildFilterSample() {
  renderSampleSvg("filter", addFilter);
}

export function buildSortSample() {
  renderSampleSvg("sort", addSort);
}

export function buildValidateSample() {
  renderSampleSvg("validate", addValidate);
}

export function buildAuthenticateSample() {
  renderSampleSvg("authenticate", addAuthenticate);
}

export function buildAuthorizeSample() {
  renderSampleSvg("authorize", addAuthorize);
}

export function buildGlobalStateRead() {
  renderSampleSvg("global_state_read", addGlobalStateRead);
}

export function buildGlobalStateWrite() {
  renderSampleSvg("global_state_write", addGlobalStateWrite);
}

export function buildIo() {
  renderSampleSvg("io", (x) =>
    addIo({ ...x, accepts: "simple", returns: "result" }),
  );
}

export function buildDistribution() {
  renderSampleSvg("distribution", addDistribution);
}

export function buildPanic() {
  renderSampleSvg("panic", addPanic);
}

export function buildPassthrough() {
  renderSampleSvg("passthrough", addPassthrough);
}
