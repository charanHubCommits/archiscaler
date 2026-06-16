function utilization(nodes, traffic){
  const result = [];

  for(const node of nodes){
    const nodeTraffic = traffic[node.id] || 0;

    const utilization =
      node.capacity > 0 ? (nodeTraffic / node.capacity) * 100 : 0;

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
