function propagateTraffic(graph, entryNode, rps){
  const traffic = {};

  for(const node in graph){
    traffic[node] = 0;
  }

  traffic[entryNode] = rps;

  const queue = [entryNode];

  while(queue.length > 0){
    const current = queue.shift();

    const neighbors = graph[current];

    if(neighbors.length === 0){
      continue;
    }

    const share =
      traffic[current] / neighbors.length;

    for(const neighbor of neighbors){
      traffic[neighbor] += share;
      queue.push(neighbor);
    }
  }

  return traffic;
}

module.exports = propagateTraffic
