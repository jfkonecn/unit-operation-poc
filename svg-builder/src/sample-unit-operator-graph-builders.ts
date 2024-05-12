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
            label: "foo",
          },
        ],
      },
      {
        type: "io",
        next: [
          {
            index: 0,
            label: "bar",
          },
        ],
      },
    ],
    [
      {
        type: "authenticate",
        label: "authenticate",
        success: [
          {
            index: 0,
            label: "success",
          },
        ],
        error: [
          {
            index: 1,
            label: "error",
          },
        ],
      },
    ],
    [
      {
        type: "authorize",
        label: "authorize",
        success: [
          {
            index: 0,
            label: "success",
          },
        ],
        error: [
          {
            index: 1,
            label: "error",
          },
        ],
      },
      {
        type: "panic",
        unitOutput: true,
      },
    ],
    [
      {
        type: "validate",
        label: "validate",
        success: [
          {
            index: 0,
            label: "success",
          },
        ],
        error: [
          {
            index: 1,
            label: "error",
          },
        ],
      },
      {
        type: "panic",
        unitOutput: true,
      },
    ],
    [
      {
        type: "map",
        label: "map",
        next: [
          {
            index: 0,
          },
        ],
      },
      {
        type: "panic",
        unitOutput: true,
      },
    ],
    [
      {
        type: "filter",
        label: "filter",
        next: [
          {
            index: 0,
          },
        ],
      },
    ],
    [
      {
        type: "distribution",
        label: "distribution",
        next: [
          {
            index: 0,
          },
          {
            index: 1,
          },
        ],
      },
    ],
    [
      {
        type: "sort",
        label: "sort",
        next: [
          {
            index: 0,
          },
        ],
      },
      {
        type: "passthrough",
        label: "passthrough",
        next: [
          {
            index: 0,
          },
        ],
      },
    ],
    [
      {
        type: "io",
        success: [
          {
            index: 0,
          },
          {
            index: 1,
          },
        ],
        error: [
          {
            index: 2,
          },
        ],
      },
    ],
    [
      {
        type: "io",
        label: "print to console",
        unitOutput: true,
      },
      {
        type: "global_state_write",
        unitOutput: true,
      },
      {
        type: "panic",
        unitOutput: true,
      },
    ],
  ];
  renderSampleSvg("test-everything", flow);
}
