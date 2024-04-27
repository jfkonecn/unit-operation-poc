import * as path from "node:path";
import { fileURLToPath } from "url";
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const pathToSvg = path.join(__dirname, "..", "svgs");
