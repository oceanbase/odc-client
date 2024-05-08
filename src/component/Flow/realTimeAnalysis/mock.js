function createMockData(totalNodes) {
    let data = {
      vertexes: [],
      statistics: {
        "bytes processed by storage": "111111"
      },
      overview: {
        Status: "RUNNING",
        "DB Time": "0s",
        "Change Time": "6 m 12 s"
      },
      topNodes: {
        duration: []
      }
    };
  
    // 构造root节点
    data.vertexes.push(createNode(0, null));
  
    let currentNodeId = 1;
  
    // 遍历每个节点，为其随机分配子节点
    for (let parentId = 0; parentId < totalNodes && currentNodeId < totalNodes; parentId++) {
      // 随机决定子节点个数（0-4个子节点）
      let numChildren = Math.floor(Math.random() * 5);
      for (let i = 0; i < numChildren && currentNodeId < totalNodes; i++) {
        let node = createNode(currentNodeId, parentId);
        data.vertexes.push(node);
        data.vertexes[parentId].outEdges.push({
          from: parentId.toString(),
          to: currentNodeId.toString(),
          weight: getRandomInt(100000)
        });
        currentNodeId++;
      }
    }
  
    // 更新topNodes
    data.topNodes.duration = data.vertexes.slice(-3).map(node => node.graphId);
  
    return data;
  }
  
  function createNode(id, parentId) {
    let inEdges = parentId !== null ? [{
      from: parentId.toString(),
      to: id.toString(),
      weight: getRandomInt(100000)
    }] : [];
  
    return {
      graphId: id.toString(),
      name: "NODE " + id,
      title: "Node " + id,
      attributes: {},
      statistics: {
        "bytes processed by storage": "11111" + id,
        "rescan times": 2 * id
      },
      overview: {
        Status: "RUNNING",
        "DB Time": "0s",
        "Change Time": "6 m 12 s"
      },
      duration: 1000 + id,
      inEdges: inEdges,
      outEdges: []
    };
  }
  
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

  // 示例：创建数据
  export const  mockData = createMockData(10);
//   console.log(JSON.stringify(mockData, null, 2));