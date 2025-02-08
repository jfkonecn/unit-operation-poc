import {
  buildGetOneRowAtATime,
  buildInMemoryJoin,
  buildQueryAllAndMap,
  buildSimplePlot,
} from "./sample-scatter-plot-builders.ts";
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
import {
  buildKey,
  buildMvcFlow,
  buildPerformanceTests,
  buildTestEverything,
  buildWeatherApiCall,
  buildUnixPipe,
  buildServerSideRender,
  buildClientSideRender,
} from "./sample-unit-operator-graph-builders.ts";

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
buildMvcFlow();
buildWeatherApiCall();
buildSimplePlot();
buildQueryAllAndMap();
buildGetOneRowAtATime();
buildInMemoryJoin();
buildPerformanceTests();
buildKey();
buildUnixPipe();
buildServerSideRender();
buildClientSideRender();
