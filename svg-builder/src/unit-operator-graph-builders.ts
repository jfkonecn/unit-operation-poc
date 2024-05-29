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
  addPassthrough,
} from "./unit-operator-builders.ts";

type UnitOperation = { label?: string };

type UnitOutput = { unitOutput: true };

type IndexLink = {
  index: number;
  label?: string;
};

type SimpleOutput = {
  next: IndexLink[];
};

type ResultOutput = {
  success: IndexLink[];
  error: IndexLink[];
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

type Passthrough = {
  type: "passthrough";
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
  | DistributionOperation
  | Passthrough;
export type OperationFlow = [
  start: StartOperation[],
  ...middle: MiddleOperation[][],
  end: EndOperation[],
];

const allUnitOperationMakers: ((
  args: Omit<AddSvgItemArgs, "label">,
) => void)[] = [
  (args) => addMap({ ...args, label: "Map" }),
  (args) => addFilter({ ...args, label: "Filter" }),
  (args) => addSort({ ...args, label: "Sort" }),
  (args) => addDistribution({ ...args, label: "Distribution" }),
  (args) => addValidate({ ...args, label: "Validate" }),
  (args) =>
    addIo({ ...args, label: "I/O", accepts: "simple", returns: "result" }),
  (args) => addAuthenticate({ ...args, label: "Authenticate" }),
  (args) => addAuthorize({ ...args, label: "Authorize" }),
  (args) => addGlobalStateRead({ ...args, label: "Global State Read" }),
  (args) => addGlobalStateWrite({ ...args, label: "Global State Write" }),
  (args) => addPanic({ ...args, label: "Panic" }),
];

function drawKey({
  svg,
  x,
  y,
  commonArgs,
  scale,
}: {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  x: number;
  y: number;
  commonArgs: Required<Pick<AddSvgItemArgs, "height" | "width" | "svg">>;
  scale: number;
}): {
  keyHeight: number;
  keyWidth: number;
} {
  const titleHeight = 50 * scale;
  const padding = 50 * scale;
  svg
    .append("text")
    .attr("stroke", "currentColor")
    .attr("x", x + padding)
    .attr("y", y + padding)
    .attr("font-size", "1rem")
    .text(() => "Key");
  let totalRows = 0;
  let totalColumns = 0;
  allUnitOperationMakers.forEach((maker, i) => {
    const rowIdx = i % 4;
    const columnIdx = Math.trunc(i / 4);
    totalRows = rowIdx + 1;
    totalColumns = columnIdx + 1;
    const xOffset = rowIdx * padding + rowIdx * commonArgs.width;
    const yOffset = columnIdx * padding + columnIdx * commonArgs.height;
    maker({
      ...commonArgs,
      x: x + padding + xOffset,
      y: y + titleHeight + padding + yOffset,
      svg,
    });
  });
  return {
    keyHeight:
      padding * 2 +
      titleHeight +
      padding * (totalRows - 1) +
      totalRows * commonArgs.height,
    keyWidth:
      padding * 2 +
      padding * (totalColumns - 1) +
      totalColumns * commonArgs.width,
  };
}

export function drawOperationFlow(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  flow: OperationFlow,
) {
  const scale = 1;
  const padding = 10 * scale;
  const spaceBetweenRows = 10 * scale;
  const spaceBetweenColumns = 200 * scale;
  const commonArgs: Required<Pick<AddSvgItemArgs, "height" | "width" | "svg">> =
    {
      height: 150 * scale,
      width: 200 * scale,
      svg,
    };
  const flowLength = flow.length;
  const maxColumnLength = flow.reduce((acc, x) => Math.max(x.length, acc), 0);
  const flowHeight =
    padding * 2 +
    maxColumnLength * commonArgs.height +
    (maxColumnLength - 1) * spaceBetweenRows;
  const flowWidth =
    padding * 2 +
    flowLength * commonArgs.width +
    (flowLength - 1) * spaceBetweenColumns;
  const { keyHeight, keyWidth } = drawKey({
    svg,
    x: 0,
    y: flowHeight,
    commonArgs,
    scale,
  });
  const viewBoxHeight = flowHeight + keyHeight;
  const viewBoxWidth = Math.max(keyWidth, flowWidth);
  svg
    .attr("height", viewBoxHeight)
    .attr("width", viewBoxWidth)
    .attr("viewBox", [0, 0, viewBoxWidth, viewBoxHeight]);

  flow.forEach((column, i) => {
    const getX = (index: number) =>
      padding + index * (spaceBetweenColumns + commonArgs.width);
    const x = getX(i);
    column.forEach((unitOperation, j) => {
      const type = unitOperation.type;
      const getY = (
        index: number,
        column:
          | StartOperation[]
          | MiddleOperation[]
          | EndOperation[]
          | undefined,
      ) => {
        if (!column)
          throw new Error(
            "Column is undefined. Are you at the end of the flow?",
          );
        const smallerColumnYPadding =
          ((maxColumnLength - column.length) *
            (spaceBetweenRows + commonArgs.height)) /
          2;
        return (
          padding +
          smallerColumnYPadding +
          index * (spaceBetweenRows + commonArgs.height)
        );
      };
      const y = getY(j, column);
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
        type Accepts = Parameters<typeof addIo>[0]["accepts"];
        type Returns = Parameters<typeof addIo>[0]["returns"];
        const returns: Returns =
          "next" in unitOperation
            ? "simple"
            : "unitOutput" in unitOperation
              ? "unit"
              : "result";

        let accepts: Accepts = "unit";
        const hasThisOperationsIndex = (links: IndexLink[]) => {
          for (const { index } of links) {
            if (index === j) {
              return true;
            }
          }
          return false;
        };
        for (const preOperation of flow[i - 1] ?? []) {
          let foundLink = false;
          if ("next" in preOperation) {
            foundLink = hasThisOperationsIndex(preOperation.next);
          } else if ("success" in preOperation) {
            foundLink =
              hasThisOperationsIndex(preOperation.success) ||
              hasThisOperationsIndex(preOperation.error);
          }
          if (foundLink) {
            accepts = "simple";
            break;
          }
        }
        addIo({
          ...args,
          accepts,
          returns,
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
      } else if (type === "passthrough") {
        addPassthrough(args);
      } else {
        throw new Error(`unknown type "${type}"`);
      }

      if (!("unitOutput" in unitOperation)) {
        if ("next" in unitOperation) {
          for (const { index, label } of unitOperation.next) {
            drawLinks({
              svg,
              label,
              strokeWidth: 4 * scale,
              spaceBetweenColumns,
              xStart: args.x + args.width,
              yStart: args.y + args.height / 2,
              xEnd: getX(i + 1),
              yEnd: getY(index, flow[i + 1]) + args.height / 2,
            });
          }
        } else {
          for (const { index, label } of unitOperation.success) {
            drawLinks({
              svg,
              label,
              strokeWidth: 4 * scale,
              spaceBetweenColumns,
              xStart: args.x + args.width,
              yStart: args.y + args.height / 3 + 8.3 * scale,
              xEnd: getX(i + 1),
              yEnd: getY(index, flow[i + 1]) + args.height / 2,
            });
          }

          for (const { index, label } of unitOperation.error) {
            drawLinks({
              svg,
              label,
              strokeWidth: 4 * scale,
              spaceBetweenColumns,
              xStart: args.x + args.width,
              yStart: args.y + (args.height * 2) / 3 - 8.3 * scale,
              xEnd: getX(i + 1),
              yEnd: getY(index, flow[i + 1]) + args.height / 2,
            });
          }
        }
      }
    });
  });
}

function drawLinks({
  svg,
  xStart,
  yStart,
  xEnd,
  yEnd,
  label,
  strokeWidth,
}: {
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  label: string | undefined;
  spaceBetweenColumns: number;
  strokeWidth: number;
} & Required<Pick<AddSvgItemArgs, "svg">>) {
  const spaceBetweenColumns = xEnd - xStart;
  svg
    .append("path")
    .attr("stroke-width", strokeWidth)
    .attr("stroke", "currentColor")
    .attr("fill", "none")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("d", [
      `M ${xStart} ${yStart}`,
      `H ${xStart + spaceBetweenColumns / 2}`,
      `L ${xEnd} ${yEnd}`,
    ]);

  svg
    .append("text")
    .attr("stroke", "currentColor")
    .attr("x", xStart)
    .attr("y", yStart - 10)
    .attr("font-size", "1rem")
    .text(() => label ?? "");
}
