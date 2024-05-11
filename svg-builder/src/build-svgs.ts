import {
  buildAuthenticateSample,
  buildAuthorizeSample,
  buildFilterSample,
  buildGlobalStateRead,
  buildGlobalStateWrite,
  buildDistribution,
  buildIo,
  buildMapSample,
  buildPanic,
  buildSortSample,
  buildValidateSample,
} from "./sample-unit-operator-builders.ts";
import { buildTestEverything } from "./sample-unit-operator-graph-builders.ts";

buildMapSample();
buildFilterSample();
buildSortSample();
buildValidateSample();
buildAuthenticateSample();
buildAuthorizeSample();
buildGlobalStateRead();
buildGlobalStateWrite();
buildIo();
buildDistribution();
buildPanic();
buildTestEverything();
