import { REACT_FLOW_ID } from './constant';
const NODE_WIDTH = 280;
const NODE_HEIGTH = 90;
const KILO = 1000;
const INIT_HEIGHT_GAP = 16;

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

// 树打开收起
const changeTreeOpen: (...args) => void = (nodeId, nodeHidden, setNodes) => {
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

const getXYPosition = () => {
  const element = document.getElementById(REACT_FLOW_ID);
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  return { width, height };
};

const locateNode: (...args) => void = (nodeId, initialNodes, setSelectedNode, setViewport) => {
  // 1. 获取节点在画布上的坐标。
  // 2. 计算画布应该移动的位移
  const node = initialNodes?.find((n) => n?.id === nodeId);
  setSelectedNode(node);
  const { width, height } = getXYPosition();
  if (node) {
    const x = -node?.position.x + width / 2 - NODE_WIDTH / 2;
    const y = -node?.position.y + height / 2 - NODE_HEIGTH / 2 - INIT_HEIGHT_GAP;
    setViewport({ x, y, zoom: 1 }, { duration: 500 });
  }
};

export const getEdgeWidth = (weight: number): number => {
  const LIMITS = {
    LEVEL_1: 500 * KILO,
    LEVEL_2: 1 * KILO * KILO,
    LEVEL_3: 10 * KILO * KILO,
    LEVEL_4: 50 * KILO * KILO,
  };

  if (weight <= LIMITS.LEVEL_1) {
    return 1;
  }
  if (weight <= LIMITS.LEVEL_2) {
    return 2;
  }
  if (weight <= LIMITS.LEVEL_3) {
    return 3;
  }
  if (weight <= LIMITS.LEVEL_4) {
    return 4;
  }
  return 5;
};

export const getUnit = (num) => {
  const MILLION = KILO * KILO; // 使用分隔符增强可读性
  const BILLION = KILO * KILO * KILO; // 使用分隔符增强可读性
  if (num >= KILO && num < MILLION) {
    return (num / KILO).toFixed(2) + 'K';
  }
  if (num >= MILLION && num < BILLION) {
    return (num / MILLION).toFixed(2) + 'M';
  }
  return num;
};

export const initCenter = (setCenter) => {
  const { height } = getXYPosition();
  const centerWidth = NODE_WIDTH / 2;
  const centerHeight = height / 2 - INIT_HEIGHT_GAP;
  setCenter(centerWidth, centerHeight, { zoom: 1 });
};

export const handleSelectNode = (setNodes, id) => {
  setNodes((nds) =>
    nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, isSelected: !node.data?.isSelected } };
      }
      return { ...node, data: { ...node.data, isSelected: false } };
    }),
  );
};

export function transformDataForReactFlow(
  vertexes,
  duration,
  setNodes,
  setSelectedNode,
  setViewport,
) {
  const nodes = [];
  const edges = [];
  const idToNodeMap = new Map();
  const rootNodes = [];
  const LEVEL_GAP = 200; // 每层的垂直间隙
  const BROTHER_GAP = 50; // 同一层级的水平间隙

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
      return NODE_WIDTH; // 叶子节点宽度
    }
    // 子节点的宽度之和加上间隔
    let totalWidth = (node.children.length - 1) * BROTHER_GAP;
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
      currentX += childWidth + BROTHER_GAP; // 加上间隔
    });
    // 无子节点或多子节点，边界条件处理
    if (node.children.length === 0 || node.children.length > 1) {
      node.x = x; // 确保此节点居中（对于叶子节点）或基于子节点的平均位置（多子节点）
    }
  }

  // 对根节点进行布局
  // todo  Reingold-Tilford algorithm
  rootNodes.forEach((root) => {
    layoutNode(root, 0, 0);
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
        changeTreeOpen: (...args: any[]) => changeTreeOpen(...args, setNodes),
        locateNode: (...args) => locateNode(...args, nodes, setSelectedNode, setViewport),
        hasChild: node.outEdges.length,
        outEdges: node?.outEdges || [],
        setSelectedNode: setSelectedNode,
        percentage: ((node.duration / duration) * 100).toFixed(2),
        isSelected: false,
      },
      position: { x: node.x, y: node.y },
      type: 'customNode',
    });

    node.children.forEach((child) => {
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

  return { nodes, edges, duration };
}
