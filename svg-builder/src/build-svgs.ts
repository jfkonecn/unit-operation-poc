import { buildSimplePlot } from "./sample-scatter-plot-builders.ts";
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
  buildPassthrough,
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
buildPassthrough();
buildTestEverything();
buildSimplePlot();
