//accepts: "simple" | "unit";
//returns: "simple" | "result" | "unit";
import { type Selection } from "d3-selection";
import {
  type AddSvgItemArgs,
  addIo,
  addPanic,
  addGlobalStateRead,
  addMap,
  addSort,
  addFilter,
  addValidate,
  addAuthorize,
  addAuthenticate,
  addDistribution,
  addGlobalStateWrite,
} from "./unit-operator-builders.ts";

type UnitOperation = { label?: string };

type UnitOutput = { unitOutput: true };

type IndexLink = {
  index: number;
  label?: string;
};

type SimpleOutput = {
  next: IndexLink;
};

type ResultOutput = {
  success: IndexLink;
  error: IndexLink;
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
  const commonArgs: Required<Pick<AddSvgItemArgs, "height" | "width" | "svg">> =
    {
      height: 100,
      width: 200,
      svg,
    };
  const flowLength = flow.length;
  const maxColumnLength = flow.reduce((acc, x) => Math.max(x.length, acc), 0);
  const viewBoxHeight =
    padding * 2 +
    maxColumnLength * commonArgs.height +
    (maxColumnLength - 1) * spaceBetweenRows;
  const viewBoxWidth =
    padding * 2 +
    flowLength * commonArgs.width +
    (flowLength - 1) * spaceBetweenColumns;
  svg.attr("viewBox", [0, 0, viewBoxWidth, viewBoxHeight]);
  flow.forEach((column, i) => {
    const x = padding + i * (spaceBetweenColumns + commonArgs.width);
    column.forEach((unitOperation, j) => {
      const type = unitOperation.type;
      const y = padding + j * (spaceBetweenRows + commonArgs.height);
      const args: Required<
        Pick<AddSvgItemArgs, "x" | "y" | "height" | "width" | "svg">
      > &
        Pick<AddSvgItemArgs, "label"> = {
        x,
        y,
        label: unitOperation.label,
        ...commonArgs,
      };
      if (type === "io") {
        addIo({
          ...args,
          accepts: "unit",
          returns: "simple",
        });
      } else if (type === "panic") {
        addPanic(args);
      } else if (type === "global_state_read") {
        addGlobalStateRead(args);
      } else if (type === "map") {
        addMap(args);
      } else if (type === "sort") {
        addSort(args);
      } else if (type === "filter") {
        addFilter(args);
      } else if (type === "validate") {
        addValidate(args);
      } else if (type === "authorize") {
        addAuthorize(args);
      } else if (type === "authenticate") {
        addAuthenticate(args);
      } else if (type === "distribution") {
        addDistribution(args);
      } else if (type === "global_state_write") {
        addGlobalStateWrite(args);
      } else {
        throw new Error(`unknown type "${type}"`);
      }
    });
  });
}
