function utilization(nodes, traffic){
  const result = [];

  for(const node of nodes){
    const nodeTraffic = traffic[node.id] || 0;

    const utilization =
      (nodeTraffic / node.capacity) * 100;

    result.push({
      id: node.id,
      traffic: nodeTraffic,
      capacity: node.capacity,
      utilization
    });
  }

  return result;
}

module.exports = utilization
