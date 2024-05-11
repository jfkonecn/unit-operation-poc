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
} from "./unit-operator-builders.ts";

function renderSampleSvg(
  label: string,
  render: (args: AddSvgItemArgs) => void,
) {
  const { svg, saveToFile } = createSvgBuilder({
    height: 600,
    width: 600,
  });
  const args: AddSvgItemArgs = {
    label: label.toUpperCase(),
    height: 200,
    x: 100,
    y: 200,
    svg,
  };
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
