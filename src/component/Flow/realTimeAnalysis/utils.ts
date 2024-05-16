export function transformDataForReactFlow(vertexes, setNodes, setSelectedNode) {
  const nodes = [];
  const edges = [];
  const durationSum = vertexes.reduce((sum, vertex) => sum + vertex.duration, 0);
  const idToNodeMap = new Map();
  const rootNodes = [];
  const LEVEL_GAP = 200; // 每层的垂直间隙

  const hiddenChild = (allNodes, node, nodeHidden, isChild = false) => {
    if (nodeHidden && isChild) {
      // 还原子节点的展示隐藏状态
      node.data.isTreeOpen = true;
    }
    node?.data?.outEdges?.forEach((child) => {
      const childId = child?.to;
      const childNode = allNodes?.find((i) => i.id == childId);
      childNode.hidden = nodeHidden;
      // 处理子node
      hiddenChild(allNodes, childNode, nodeHidden, true);
    });
  };
  const changeTreeOpen = (nodeId, nodeHidden) => {
    setNodes((nds) =>
      nds.map((node) => {
        //   debugger
        if (node.id === nodeId) {
          // node.hidden = true
          hiddenChild(nds, node, nodeHidden);
          return {
            ...node,
            data: {
              ...node.data,
              isTreeOpen: !node.data.isTreeOpen,
            },
          };
        }
        return node;
      }),
    );
  };

  // 构建节点映射和确定根节点
  vertexes.forEach((vertex) => {
    const node = { ...vertex, children: [], x: 0, y: 0 };
    idToNodeMap.set(vertex.graphId, node);
    if (!vertex.hasOwnProperty('inEdges') || vertex.inEdges.length === 0) {
      rootNodes.push(node);
    }
  });

  // 建立子节点和父节点关系
  vertexes.forEach((vertex) => {
    vertex.outEdges.forEach((edge) => {
      const parent = idToNodeMap.get(edge.from);
      const child = idToNodeMap.get(edge.to);
      parent.children.push(child);
    });
  });

  // 计算节点宽度的函数
  function calculateNodeWidth(node) {
    if (node.children.length === 0) {
      return 280; // 叶子节点宽度
    }
    // 子节点的宽度之和加上间隔
    let totalWidth = (node.children.length - 1) * 50;
    node.children.forEach((child) => (totalWidth += calculateNodeWidth(child)));
    return totalWidth;
  }

  // 布局节点的递归函数
  function layoutNode(node, x, level) {
    // 设置节点的x和y
    node.x = x;
    node.y = level * LEVEL_GAP;

    let currentX = x - calculateNodeWidth(node) / 2;
    node.children.forEach((child, index) => {
      let childWidth = calculateNodeWidth(child);
      // 更新子节点的位置，调整currentX以反映子节点的实际宽度
      layoutNode(child, currentX + childWidth / 2, level + 1);
      currentX += childWidth + 50; // 加上间隔
    });
    // 无子节点或多子节点，边界条件处理
    if (node.children.length === 0 || node.children.length > 1) {
      node.x = x; // 确保此节点居中（对于叶子节点）或基于子节点的平均位置（多子节点）
    }
  }

  // 对根节点进行布局
  rootNodes.forEach((root) => {
    layoutNode(root, 0, 0); // 假设根节点从(0,0)开始布局
  });

  // 创建nodes和edges数组
  idToNodeMap.forEach((node) => {
    nodes.push({
      id: node.graphId.toString(),
      data: {
        ...node,
        label: `${node.name}`,
        id: node.graphId.toString(),
        isTreeOpen: true,
        changeTreeOpen: changeTreeOpen,
        hasChild: node.outEdges.length,
        outEdges: node?.outEdges || [],
        setSelectedNode: setSelectedNode,
        percentage: ((node.duration / durationSum) * 100).toFixed(2),
      },
      position: { x: node.x, y: node.y },
      type: 'customNode',
    });

    node.children.forEach((child) => {
      // debugger
      edges.push({
        id: `e${node.graphId}-${child.graphId}`,
        source: node.graphId.toString(),
        target: child.graphId.toString(),
        type: 'custom-edge',
        data: {
          weight: child?.inEdges?.[0]?.weight,
        },
      });
    });
  });

  return { nodes, edges, durationSum };
}
