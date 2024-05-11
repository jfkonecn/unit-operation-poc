//accepts: "simple" | "unit";
//returns: "simple" | "result" | "unit";
import { type Selection } from "d3-selection";
import { AddSvgItemArgs, addIo } from "./unit-operator-builders.ts";

type UnitOperation = { label?: string };

type UnitOutput = { unitOutput: true };

type SimpleOutput = {
  nextIndex: number;
};

type ResultOutput = {
  successIndex: number;
  errorIndex: number;
};

type GlobalStateReadOperation = {
  type: "global_state_read";
} & UnitOperation &
  SimpleOutput;

type RootIoOperation = {
  type: "io";
} & UnitOperation &
  SimpleOutput;

type MiddleIoOperation = {
  type: "io";
} & UnitOperation &
  (SimpleOutput | ResultOutput | UnitOutput);

type EndIoOperation = {
  type: "io";
} & UnitOperation &
  UnitOutput;

type IoOperation = RootIoOperation | MiddleIoOperation | EndIoOperation;

type MapOperation = {
  type: "map";
} & UnitOperation &
  SimpleOutput;

type FilterOperation = {
  type: "filter";
} & UnitOperation &
  SimpleOutput;

type SortOperation = {
  type: "sort";
} & UnitOperation &
  SimpleOutput;

type ValidateOperation = {
  type: "validate";
} & UnitOperation &
  ResultOutput;

type AuthenticateOperation = {
  type: "authenticate";
} & UnitOperation &
  ResultOutput;

type AuthorizeOperation = {
  type: "authorize";
} & UnitOperation &
  ResultOutput;

type GlobalStateWriteOperation = {
  type: "global_state_write";
} & UnitOperation &
  UnitOutput;

type DistributionOperation = {
  type: "distribution";
} & UnitOperation &
  SimpleOutput;

type PanicOperation = {
  type: "panic";
} & UnitOperation &
  UnitOutput;

type StartOperation = RootIoOperation | GlobalStateReadOperation;
type EndOperation = EndIoOperation | PanicOperation | GlobalStateWriteOperation;

type MiddleOperation =
  | StartOperation
  | EndOperation
  | MapOperation
  | FilterOperation
  | IoOperation
  | SortOperation
  | ValidateOperation
  | AuthenticateOperation
  | AuthorizeOperation
  | DistributionOperation;
export type OperationFlow = [
  start: StartOperation[],
  ...middle: MiddleOperation[][],
  end: EndOperation[],
];

export function drawOperationFlow(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  flow: OperationFlow,
) {
  const padding = 10;
  const spaceBetweenRows = 10;
  const spaceBetweenColumns = 10;
  const heightAndWidth: Required<Pick<AddSvgItemArgs, "height" | "width">> = {
    height: 100,
    width: 200,
  };
  const flowLength = flow.length;
  const maxColumnLength = flow.reduce((acc, x) => Math.max(x.length, acc), 0);
  const viewBoxHeight =
    padding * 2 +
    maxColumnLength * heightAndWidth.height +
    (maxColumnLength - 1) * spaceBetweenRows;
  const viewBoxWidth =
    padding * 2 +
    flowLength * heightAndWidth.width +
    (flowLength - 1) * spaceBetweenColumns;
  svg.attr("viewBox", [0, 0, viewBoxWidth, viewBoxHeight]);
  for (const column of flow) {
    for (const unitOperation of column) {
      const type = unitOperation.type;
      if (type === "io") {
        addIo({
          x: 0,
          y: 0,
          ...heightAndWidth,
          label: unitOperation.label,
          svg,
          accepts: "unit",
          returns: "simple",
        });
      }
    }
  }
}
