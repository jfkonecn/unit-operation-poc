import { type Selection } from "d3-selection";
import * as d3 from "d3";
// https://d3-graph-gallery.com/graph/scatter_basic.html
export function drawScatterPlot(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
) {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  return d3
    .csv(
      "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv",
      function (
        data:
          | string[]
          | Iterable<string>
          | d3.ValueFn<SVGGElement, unknown, string[] | Iterable<string>>,
      ) {
        svg
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")",
          );
        // Add X axis
        const x = d3.scaleLinear().domain([0, 4000]).range([0, width]);
        svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear().domain([0, 500000]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        console.log(data);

        // Add dots
        svg
          .append("g")
          .selectAll("dot")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", function (d) {
            console.log(d.GrLivArea);
            return x(d.GrLivArea);
          })
          .attr("cy", function (d) {
            return y(d.SalePrice);
          })
          .attr("r", 1.5)
          .style("fill", "#69b3a2");
      },
    )
    .catch(console.error);
}
