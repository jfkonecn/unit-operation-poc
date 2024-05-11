import { createSvgBuilder } from "./unit-operator-builders.ts";
import {
  type OperationFlow,
  drawOperationFlow,
} from "./unit-operator-graph-builders.ts";

function renderSampleSvg(label: string, flow: OperationFlow) {
  const { svg, saveToFile } = createSvgBuilder();
  drawOperationFlow(svg, flow);
  saveToFile(`unit-operation-graphs/${label}.svg`);
}

export function buildTestEverything() {
  const flow: OperationFlow = [[], []];
  renderSampleSvg("test-everything", flow);
}
