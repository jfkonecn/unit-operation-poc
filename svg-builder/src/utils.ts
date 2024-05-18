import * as path from "node:path";
import * as consts from "./consts.ts";

export function getPathToSvg(fileName: string) {
  return path.join(consts.pathToSvg, fileName);
}
