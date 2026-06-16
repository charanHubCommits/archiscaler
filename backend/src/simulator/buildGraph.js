function buildGraph (architecture) {
  const graph = {}

  for (const node of architecture.nodes){
    graph[node.id] = []
  }

  for(const edge of architecture.edges) {
    graph[edge.source].push(edge.target)
  }

  return graph
}

module.exports = buildGraph
