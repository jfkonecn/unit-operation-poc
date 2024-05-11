type RootType = "global_state_read" | "io";
type CustomArray = [foo: "foo", ...middle: "bar"[], baz: "baz"];

export type UnitOperation = {
  label: string;
} & (
  | {
      type:
        | "map"
        | "filter"
        | "sort"
        | "global_state_read"
        | "io"
        | "distribution"
        | "panic";
      nextIndex: number;
    }
  | {
      type:
        | "map"
        | "filter"
        | "sort"
        | "validate"
        | "authenticate"
        | "authorize"
        | "global_state_read"
        | "global_state_write"
        | "io"
        | "distribution"
        | "panic";
    }
  | {
      type:
        | "map"
        | "filter"
        | "sort"
        | "validate"
        | "authenticate"
        | "authorize"
        | "global_state_read"
        | "global_state_write"
        | "io"
        | "distribution"
        | "panic";
    }
);
