const buildGraph = require("./buildGraph")
const propagateTraffic = require("./propagateTraffic")
const calculateUtilization = require("./utilization")


function simulate(architecture, rps){

  const graph = buildGraph(architecture)

  const traffic =
    propagateTraffic(
      graph,
      "client",
      rps
    )

  const result =
    calculateUtilization(
      architecture.nodes,
      traffic
    )

  return result
}

module.exports = simulate
