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
  const flow: OperationFlow = [
    [
      {
        type: "global_state_read",
        next: [
          {
            index: 0,
            label: "test",
          },
        ],
      },
      {
        type: "io",
        next: [
          {
            index: 0,
            label: "test",
          },
        ],
      },
    ],
    [
      {
        type: "panic",
        unitOutput: true,
      },
    ],
  ];
  renderSampleSvg("test-everything", flow);
}
