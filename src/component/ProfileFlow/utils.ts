import { IProfileVertexes } from '@/d.ts';
import type { Node as FlowNode, SetCenter, SetViewport } from 'reactflow';
import {
  CPU_TIME,
  INIT_HEIGHT_GAP,
  IO_WAIT_TIME,
  KILO,
  NODE_HEIGTH,
  NODE_WIDTH,
  REACT_FLOW_ID,
} from './constant';
import { Node, Tree } from './treeLayout';

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
const changeTreeOpen: (...args) => void = (
  nodeId: number | string,
  nodeHidden: boolean,
  setNodes: React.Dispatch<React.SetStateAction<FlowNode<any, string>[]>>,
) => {
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

export const locateNode: (...args) => void = (
  nodeId,
  initialNodes,
  setSelectedNode,
  setViewport,
  setNodes,
) => {
  // 1. 获取节点在画布上的坐标
  const node = initialNodes?.find((n) => n?.id === nodeId);
  // 2. 设置当前选中节点
  setSelectedNode(node);
  // 3. 展开节点
  setNodes((nds) =>
    nds.map((node) => {
      hiddenChild(nds, node, false);
      return {
        ...node,
        data: {
          ...node.data,
          isTreeOpen: true,
        },
      };
    }),
  );
  // 4. 计算画布应该移动的位移
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

export const getUnit = (num: number) => {
  const MILLION = KILO * KILO;
  const BILLION = KILO * KILO * KILO;
  if (num >= KILO && num < MILLION) {
    return (num / KILO).toFixed(1) + 'K';
  }
  if (num >= MILLION && num < BILLION) {
    return (num / MILLION).toFixed(1) + 'M';
  }
  return num;
};

export const initCenter = (setCenter: SetCenter) => {
  const { height } = getXYPosition();
  const centerWidth = NODE_WIDTH / 2;
  const centerHeight = height / 2 - INIT_HEIGHT_GAP;
  setCenter(centerWidth, centerHeight, { zoom: 1 });
};

export const handleSelectNode = (
  setNodes: React.Dispatch<React.SetStateAction<FlowNode<any, string>[]>>,
  id: number | string,
) => {
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
  vertexes: IProfileVertexes[],
  duration: number,
  setNodes: React.Dispatch<React.SetStateAction<FlowNode<any, string>[]>>,
  setSelectedNode: React.Dispatch<any>,
  setViewport: SetViewport,
) {
  const nodes = [];
  const edges = [];
  const idToNodeMap = new Map();
  const rootNodes = [];

  // 构建节点映射和确定根节点
  vertexes.forEach((vertex) => {
    const node = { ...vertex, children: [], x: 0, y: 0 };
    idToNodeMap.set(vertex.graphId, node);
    if (!vertex.hasOwnProperty('inEdges') || vertex.inEdges?.length === 0) {
      rootNodes.push(node);
    }
  });
  // 建立子节点和父节点关系
  vertexes.forEach((vertex) => {
    vertex?.outEdges?.forEach((edge) => {
      const parent = idToNodeMap.get(edge?.from);
      const child = idToNodeMap.get(edge?.to);
      parent.children.push(child);
    });
  });
  function buildTree(data: IProfileVertexes[]): Tree {
    const tree = new Tree();
    const nodesMap = new Map<string, Node>();
    if (!data.length) return;
    data?.forEach((nodeData) => {
      const node = new Node(nodeData, null, 0, 0, tree.rootX, tree.rootY);
      nodesMap.set(nodeData?.graphId?.toString(), node);
    });
    data?.forEach((nodeData) => {
      const node = nodesMap.get(nodeData?.graphId?.toString());
      if (node) {
        nodeData?.outEdges?.forEach((edge) => {
          const childNode = nodesMap.get(edge.to);
          if (childNode) {
            childNode.parent = node;
            childNode.layer = node.layer + 1;
            node.child.push(childNode);
          }
        });
      }
    });

    const rootNode = Array.from(nodesMap.values()).find((node) => !node.parent);
    tree.root = rootNode ? rootNode : nodesMap.values().next().value;
    nodesMap.forEach((node) => {
      if (tree.hashTree[node.layer]) {
        tree.hashTree[node.layer].push(node);
      } else {
        tree.hashTree[node.layer] = [node];
      }
    });

    return tree;
  }

  const treeList = buildTree(vertexes);
  treeList.layout();
  function convertTreeToReactFlow(tree) {
    function traverseAndBuild(node, parentId = null, isParantOverlap = false) {
      const reactFlowNode = {
        id: node.data.graphId,
        position: { x: node.x, y: node.y },
        data: {
          ...node.data,
          label: `${node.data.name}`,
          id: node.data.graphId,
          isTreeOpen: true,
          changeTreeOpen: (...args: any[]) => changeTreeOpen(...args, setNodes),
          locateNode: (...args) =>
            locateNode(...args, nodes, setSelectedNode, setViewport, setNodes),
          hasChild: node?.data?.outEdges?.length,
          outEdges: node?.data?.outEdges || [],
          setSelectedNode: setSelectedNode,
          percentageInCompare:
            (
              (node?.data?.overview?.[CPU_TIME] * 100) /
              (node?.data?.overview?.[CPU_TIME] + node?.data?.overview?.[IO_WAIT_TIME])
            ).toFixed(2) || '',
          percentageInAll: duration ? ((node?.data.duration / duration) * 100).toFixed(2) : '',
          isSelected: false,
        },
        type: 'customNode',
      };

      nodes.push(reactFlowNode);

      if (parentId !== null) {
        const reactFlowEdge = {
          id: `e${parentId}-${node.data.graphId}`,
          source: parentId,
          target: node.data.graphId,
          type: 'CustomEdge',
          data: {
            weight: node?.data.inEdges?.[0]?.weight,
            isOverlap: isParantOverlap,
            isSingleChild: node?.parent?.data?.outEdges?.length === 1,
          },
        };
        edges.push(reactFlowEdge);
      }

      for (let child of node.child) {
        traverseAndBuild(child, node?.data?.graphId, !!node?.data?.subNodes);
      }
    }

    if (tree && tree.root) {
      traverseAndBuild(tree.root);
    }
  }
  convertTreeToReactFlow(treeList);
  const nodeDurationSum = nodes.reduce((accumulator, currentObject) => {
    return accumulator + currentObject?.data?.duration;
  }, 0);

  return { nodes, edges, nodeDurationSum };
}
