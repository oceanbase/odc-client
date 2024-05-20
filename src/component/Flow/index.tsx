import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import CustomEdge from './realTimeAnalysis/customComponents/CustomEdge';
import CustomNode from './realTimeAnalysis/customComponents/CustomNode';
import CustomControl from './realTimeAnalysis/customComponents/CustomControl';
import CustomDetailBox from './realTimeAnalysis/customComponents/CustomDetailBox';
import { transformDataForReactFlow } from './realTimeAnalysis/utils';
import * as d3 from 'd3';
import 'reactflow/dist/style.css';

const edgeTypes = { 'custom-edge': CustomEdge };

const nodeTypes = { customNode: CustomNode };

function Flow(props) {
  const { dataSource } = props;

  if (!dataSource) return null;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const locateNode = (nodeId) => {
    // debugger
    // 1. 获取节点信息:它在画布上的坐标。
    // 2. 计算画布应该移动的位移: 根据节点的坐标和画布的尺寸，计算出为了使节点居中，画布应该如何移动。

    // 3. 更新React Flow的状态: 使用React Flow提供的API来更新画布的位置和/或缩放级别，以确保节点被移动到中心。
    const node = initialNodes?.find((n) => n?.id === nodeId);
    setSelectedNode(node);
    const element = document.getElementById('react-flow-box');
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    if (node) {
      // 假设画布大小是800x600，这个根据你的实际大小调整
      const x = -node?.position.x + width / 2 - 280 / 2;
      const y = -node?.position.y + height / 2 - 90 / 2;
      setViewport({ x, y, zoom: 1 }, { duration: 500 });
    }
  };
  const { nodes: initialNodes, edges: initialEdges } = transformDataForReactFlow(
    dataSource?.vertexes,
    dataSource?.duration,
    setNodes,
    setSelectedNode,
    locateNode,
  );

  const { zoomIn, zoomOut, setCenter, setViewport } = useReactFlow();

  const reactFlowInstance = useRef(null);
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    // setSelectedNode(initialNodes[0]);
  }, []);

  useEffect(() => {
    const element = document.getElementById('react-flow-box');
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const centerWidth = width / 4 - 280;
    const centerHeight = height / 2 - 16;
    setCenter(centerWidth, centerHeight, { zoom: 1 });
  }, [setCenter]);

  useEffect(() => {
    // if (!initialNodes.length) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode?.id) {
          // debugger
          return { ...node, data: { ...node.data, isSelected: !node.data?.isSelected } };
        }
        return { ...node, data: { ...node.data, isSelected: false } };
      }),
    );
  }, [JSON.stringify(selectedNode?.id)]);

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, type: 'custom-edge' };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'rgba(0,0,0,0.02)',
        border: '1px solid #E0E0E0',
        width: 'calc(100% - 320px)',
      }}
    >
      <CustomDetailBox
        dataSource={nodes.find((i) => i.id === selectedNode?.id)}
        topNodes={dataSource?.topNodes}
        initialNodes={initialNodes}
      />
      {/* <button onClick={() => setCenter(100, 100, { zoom: 2, duration: 50 })}>111</button>
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button> */}
      <ReactFlow
        id="react-flow-box"
        {...props}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        // fitView
        ref={reactFlowInstance}
        // fitViewOptions={{
        //   ...defaultViewport,
        // }}
        onElementClick={(event, element) => {
          setSelectedNode(element);
        }}
      >
        <CustomControl />
      </ReactFlow>
    </div>
  );
}

function FlowWithProvider(props) {
  // debugger
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
export default FlowWithProvider;
