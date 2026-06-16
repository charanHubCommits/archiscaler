function propagateTraffic(graph, entryNode, rps){
  const inDegree = {};
  const traffic = {};

  // Initialize in-degrees and traffic
  for (const node in graph) {
    inDegree[node] = 0;
    traffic[node] = 0;
  }

  // Calculate in-degrees for all nodes
  for (const node in graph) {
    for (const neighbor of graph[node]) {
      if (inDegree[neighbor] !== undefined) {
        inDegree[neighbor]++;
      }
    }
  }

  // Set entry node traffic
  if (traffic[entryNode] !== undefined) {
    traffic[entryNode] = rps;
  }

  // Queue nodes with 0 in-degree
  const queue = [];
  for (const node in graph) {
    if (inDegree[node] === 0) {
      queue.push(node);
    }
  }

  let processedCount = 0;

  // Process the graph in topological order
  while (queue.length > 0) {
    const current = queue.shift();
    processedCount++;

    const neighbors = graph[current] || [];
    if (neighbors.length === 0) {
      continue;
    }

    const share = traffic[current] / neighbors.length;

    for (const neighbor of neighbors) {
      if (traffic[neighbor] !== undefined) {
        traffic[neighbor] += share;
      }
      if (inDegree[neighbor] !== undefined) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }
  }

  // If we processed fewer nodes than exist in the graph, there is a cycle
  if (processedCount < Object.keys(graph).length) {
    throw new Error("Cycle detected in architecture graph. Only DAGs are supported.");
  }

  return traffic;
}

module.exports = propagateTraffic;

