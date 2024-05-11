//accepts: "simple" | "unit";
//returns: "simple" | "result" | "unit";
import { type Selection } from "d3-selection";

type UnitOutput = { unitOutput: true };

type SimpleOutput = {
  successIndex: number;
  errorIndex: number;
};

type ResultOutput = {
  successIndex: number;
  errorIndex: number;
};

type GlobalStateReadOperation = {
  type: "global_state_read";
} & SimpleOutput;

type RootIoOperation = {
  type: "io";
} & SimpleOutput;

type MiddleIoOperation = {
  type: "io";
} & (SimpleOutput | ResultOutput | UnitOutput);

type EndIoOperation = {
  type: "io";
} & UnitOutput;

type IoOperation = RootIoOperation | MiddleIoOperation | EndIoOperation;

type MapOperation = {
  type: "map";
} & SimpleOutput;

type FilterOperation = {
  type: "filter";
} & SimpleOutput;

type SortOperation = {
  type: "sort";
} & SimpleOutput;

type ValidateOperation = {
  type: "validate";
} & ResultOutput;

type AuthenticateOperation = {
  type: "authenticate";
} & ResultOutput;

type AuthorizeOperation = {
  type: "authorize";
} & ResultOutput;

type GlobalStateWriteOperation = {
  type: "global_state_write";
} & UnitOutput;

type DistributionOperation = {
  type: "distribution";
} & SimpleOutput;

type PanicOperation = {
  type: "panic";
} & UnitOutput;

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
type OperationFlow = [
  start: StartOperation,
  ...middle: MiddleOperation[],
  end: EndOperation,
];

export function drawOperationFlow(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  flow: OperationFlow,
) {
  console.log(svg);
  console.log(flow);
  return;
}
