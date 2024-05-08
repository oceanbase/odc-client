export default (args) => {
  const { metricItem, params, filter, apis, type, setNodes } = args;

  const changeTreeOpen = (nodeId, nodeHidden) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
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

  return {
    getInitialNodes() {
      return [
        {
          id: '1',
          // data里添加id就可以获取到id
          data: {
            label: 'Node 1',
            id: '1',
            isTreeOpen: true,
            changeTreeOpen: changeTreeOpen,
            hasChild: true,
            parent: 0,
            outEdges: [
              {
                from: '1',
                to: '2',
                weight: 1000,
              },
              {
                from: '1',
                to: '3',
                weight: 1000,
              },
            ],
          },
          position: { x: 150, y: 0 },
          type: 'customNode',
        },
        {
          id: '2',
          data: {
            label: 'Node 2',
            id: '2',
            isTreeOpen: true,
            changeTreeOpen: changeTreeOpen,
            hasChild: true,
            parent: 1,
            outEdges: [
              {
                from: '2',
                to: '4',
                weight: 1000,
              },
            ],
          },
          position: { x: 100, y: 150 },
          type: 'customNode',
        },
        {
          id: '3',
          data: {
            label: 'Node 3',
            id: '3',
            isTreeOpen: true,
            changeTreeOpen: changeTreeOpen,
            hasChild: true,
            parent: 1,
            outEdges: [
              {
                from: '3',
                to: '5',
                weight: 1000,
              },
              {
                from: '3',
                to: '6',
                weight: 1000,
              },
            ],
          },
          position: { x: 300, y: 150 },
          type: 'customNode',
        },
        {
          id: '4',
          data: {
            label: 'Node 4',
            id: '4',
            isTreeOpen: true,
            changeTreeOpen: changeTreeOpen,
            hasChild: false,
            parent: 2,
          },
          position: { x: 0, y: 250 },
          type: 'customNode',
        },
        {
          id: '5',
          data: {
            label: 'Node 5',
            id: '5',
            isTreeOpen: true,
            changeTreeOpen: changeTreeOpen,
            hasChild: false,
            parent: 3,
          },
          position: { x: 250, y: 250 },
          type: 'customNode',
        },
        {
          id: '6',
          data: {
            label: 'Node 6',
            id: '6',
            isTreeOpen: true,
            changeTreeOpen: changeTreeOpen,
            hasChild: false,
            parent: 3,
          },
          position: { x: 400, y: 250 },
          type: 'customNode',
        },
      ];
    },
  };
};

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
