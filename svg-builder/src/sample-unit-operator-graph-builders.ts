import { createSvgBuilder } from "./unit-operator-builders.ts";
import {
  type OperationFlow,
  drawOperationFlow,
} from "./unit-operator-graph-builders.ts";

function renderSampleSvg(
  label: string,
  flow: OperationFlow,
  includeSlideSize = true,
  includeKey = true,
) {
  const { svg, saveToFile } = createSvgBuilder();
  drawOperationFlow(svg, flow, [0, flow.length - 1], includeKey);
  saveToFile(`unit-operation-graphs/${label}.svg`);
  const totalColumns = 2;
  console.log(`${label} has ${flow.length} columns`);
  if (includeSlideSize) {
    for (let i = 0; i < flow.length - (totalColumns - 1); i++) {
      const { svg: svg2, saveToFile: saveToFile2 } = createSvgBuilder();
      drawOperationFlow(svg2, flow, [i, i + (totalColumns - 1)], false, 5);
      saveToFile2(`unit-operation-graphs/${label}_${i}.svg`);
    }
  }
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
export function buildMvcFlow() {
  const flow: OperationFlow = [
    [
      {
        type: "io",
        label: "Incoming HTTP Request",
        next: [
          {
            index: 0,
          },
        ],
      },
    ],
    [
      {
        type: "authenticate",
        label: "Authenticate",
        success: [
          {
            index: 0,
          },
        ],
        error: [
          {
            index: 1,
          },
        ],
      },
    ],
    [
      {
        type: "distribution",
        label: "Router",
        next: [
          {
            index: 0,
          },
          {
            index: 1,
          },
          {
            index: 2,
          },
        ],
      },
      {
        type: "io",
        unitOutput: true,
        label: "401 Error",
      },
    ],
    [
      {
        type: "passthrough",
        label: "/patients",
        next: [{ index: 0 }],
      },
      {
        type: "passthrough",
        label: "/patients/{id}",
        next: [{ index: 1 }],
      },
      {
        type: "passthrough",
        next: [{ index: 2 }],
      },
    ],
    [
      {
        type: "authorize",
        label: "Authorize",
        success: [
          {
            index: 0,
          },
        ],
        error: [
          {
            index: 1,
          },
        ],
      },
      {
        type: "authorize",
        label: "Authorize",
        success: [
          {
            index: 2,
          },
        ],
        error: [
          {
            index: 3,
          },
        ],
      },
      {
        type: "io",
        unitOutput: true,
        label: "404 Error",
      },
    ],
    [
      {
        type: "io",
        label: "Get Patients Table Data",
        success: [
          {
            index: 0,
          },
        ],
        error: [{ index: 1 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "403 Error",
      },
      {
        type: "io",
        label: "Get Patient Table Record",
        success: [
          {
            index: 2,
          },
        ],
        error: [{ index: 3 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "403 Error",
      },
    ],
    [
      {
        type: "map",
        label: "Map to JSON",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "500 Error",
      },
      {
        type: "map",
        label: "Map to JSON",
        next: [{ index: 1 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "500 Error",
      },
    ],
    [
      {
        type: "io",
        unitOutput: true,
        label: "200 Response",
      },
      {
        type: "io",
        unitOutput: true,
        label: "200 Response",
      },
    ],
  ];
  renderSampleSvg("mvc-flow", flow);
}
export function buildUnixPipe() {
  const flow: OperationFlow = [
    [
      {
        type: "io",
        label: "cat file.txt",
        success: [
          {
            index: 0,
          },
        ],
        error: [
          {
            index: 1,
          },
        ],
      },
    ],
    [
      {
        type: "filter",
        label: 'grep "word"',
        next: [
          {
            index: 0,
          },
        ],
      },
      {
        type: "io",
        unitOutput: true,
        label: "Standard Error",
      },
    ],
    [
      {
        type: "map",
        label: "wc -l",
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
        unitOutput: true,
        label: "Standard Out",
      },
    ],
  ];
  renderSampleSvg("unix-pipe", flow);
}

export function buildWeatherApiCall() {
  const flow: OperationFlow = [
    [
      {
        type: "io",
        label: "Ask for Location from User",
        next: [{ index: 0 }],
      },
    ],
    [
      {
        type: "validate",
        label: "Validate location",
        success: [{ index: 0 }],
        error: [{ index: 1 }],
      },
    ],
    [
      {
        type: "io",
        label: "Make HTTP Request",
        success: [{ index: 0 }],
        error: [{ index: 1 }],
      },
      { type: "panic", label: "Panic", unitOutput: true },
    ],
    [
      {
        type: "validate",
        label: "Parse JSON",
        success: [{ index: 0 }],
        error: [{ index: 1 }],
      },
      { type: "panic", label: "Panic", unitOutput: true },
    ],
    [
      {
        type: "map",
        label: "Convert to Display String",
        next: [{ index: 0 }],
      },
      { type: "panic", label: "Panic", unitOutput: true },
    ],
    [
      {
        type: "io",
        unitOutput: true,
        label: "Print Payload",
      },
    ],
  ];
  renderSampleSvg("weather-api-call", flow);
}

export function buildPerformanceTests() {
  const flow: OperationFlow = [
    [
      {
        type: "io",
        label: "Read People CSV File",
        next: [{ index: 0 }],
      },
    ],
    [
      {
        type: "validate",
        label: "Validate Person Rows",
        success: [{ index: 0 }],
        error: [{ index: 1 }],
      },
    ],
    [
      {
        type: "sort",
        label: "Quick Sort Person Rows",
        next: [{ index: 0 }],
      },
      { type: "panic", label: "Panic", unitOutput: true },
    ],
    [
      {
        type: "io",
        label: "Print Person Rows",
        success: [{ index: 0 }],
        error: [{ index: 1 }],
      },
    ],
    [
      {
        type: "io",
        label: "Free Used Memory",
        unitOutput: true,
      },
      { type: "panic", label: "Panic", unitOutput: true },
    ],
  ];
  renderSampleSvg("performance-tests", flow);
}

export function buildKey() {
  renderSampleSvg("key", [[], [], [], []] as unknown as OperationFlow, false);
}

export function buildServerSideRender() {
  const flow: OperationFlow = [
    [
      {
        type: "io",
        label: "GET index.html",
        success: [
          {
            index: 0,
          },
        ],
        error: [
          {
            index: 1,
          },
        ],
      },
    ],
    [
      {
        type: "passthrough",
        label: "/index.html",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "404 Error",
      },
    ],
    [
      {
        type: "io",
        label: "Get Patients Table Data",
        success: [
          {
            index: 0,
          },
        ],
        error: [{ index: 1 }],
      },
    ],
    [
      {
        type: "map",
        label: "Map to HTML",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "500 Error",
      },
    ],
    [
      {
        type: "io",
        label: "200 Response",
        next: [{ index: 0 }],
      },
    ],
    [
      {
        type: "io",
        label: "Parse HTML",
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
        label: "GET styles.css",
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
        type: "passthrough",
        label: "/styles.css",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "404 Error",
      },
    ],
    [
      {
        type: "io",
        label: "200 Reponse",
        next: [{ index: 0 }],
      },
    ],
    [
      {
        type: "io",
        label: "Render HTML",
        unitOutput: true,
      },
    ],
  ];
  renderSampleSvg("server-side-render", flow, true, false);
}

export function buildClientSideRender() {
  const flow: OperationFlow = [
    [
      {
        type: "io",
        label: "GET index.html",
        success: [
          {
            index: 0,
          },
        ],
        error: [
          {
            index: 1,
          },
        ],
      },
    ],
    [
      {
        type: "passthrough",
        label: "/index.html",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "404 Error",
      },
    ],
    [
      {
        type: "io",
        label: "200 Response",
        next: [{ index: 0 }],
      },
    ],
    [
      {
        type: "io",
        label: "Parse HTML",
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
        type: "io",
        label: "GET styles.css",
        next: [
          {
            index: 0,
          },
          {
            index: 1,
          },
        ],
      },
      {
        type: "io",
        label: "GET app.js",
        next: [
          {
            index: 2,
          },
          {
            index: 3,
          },
        ],
      },
    ],
    [
      {
        type: "passthrough",
        label: "/styles.css",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "404 Error",
      },
      {
        type: "passthrough",
        label: "/app.js",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "404 Error",
      },
    ],
    [
      {
        type: "io",
        label: "Render HTML",
        next: [{ index: 0 }],
      },
    ],
    [
      {
        type: "io",
        label: "GET /api/patients",
        success: [
          {
            index: 0,
          },
        ],
        error: [
          {
            index: 1,
          },
        ],
      },
    ],
    [
      {
        type: "passthrough",
        label: "/api/patients",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "404 Error",
      },
    ],
    [
      {
        type: "io",
        label: "Get Patients Table Data",
        success: [
          {
            index: 0,
          },
        ],
        error: [{ index: 1 }],
      },
    ],
    [
      {
        type: "map",
        label: "Map to JSON",
        next: [{ index: 0 }],
      },
      {
        type: "io",
        unitOutput: true,
        label: "500 Error",
      },
    ],
    [
      {
        type: "io",
        label: "200 Response",
        next: [{ index: 0 }],
      },
    ],
    [
      {
        type: "validate",
        label: "Parse JSON",
        success: [{ index: 0 }],
        error: [{ index: 0 }],
      },
    ],
    [
      {
        type: "io",
        label: "Render HTML",
        unitOutput: true,
      },
    ],
  ];
  renderSampleSvg("client-side-render", flow, true, false);
}
