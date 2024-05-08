import { useCallback, useEffect, useRef } from 'react';
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
import { mockData } from './realTimeAnalysis/mock';
import { transformDataForReactFlow } from './realTimeAnalysis/utils';

import 'reactflow/dist/style.css';

// 1. 接口防回转需要的节点的函数
// 2. 节点x和y的函数
// 3. 点击加减号更新树的函数
// 4. 计算定位(移到驶视图中心)

const edgeTypes = { 'custom-edge': CustomEdge };

const nodeTypes = { customNode: CustomNode };

function Flow(props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { nodes: initialNodes, edges: initialEdges } = transformDataForReactFlow(
    mockData.vertexes,
    setNodes,
  );
  const { zoomIn, zoomOut, setCenter } = useReactFlow();
  const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

  const reactFlowInstance = useRef(null);

  // const fitView = () => {
  //   const flowInstance = reactFlowInstance.current;
  //   debugger;
  //   if (flowInstance) {
  //     const { width, height, clientWidth, clientHeight } =
  //       flowInstance.container;
  //     const centerX = (width + clientWidth) / 2;
  //     const centerY = (height + clientHeight) / 2;
  //     flowInstance.fitView([centerX, centerY], [clientWidth, clientHeight]);
  //   }
  // };

  // useEffect(() => {
  //   fitView();
  // }, []); // 确保只在组件挂载后调用

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, type: 'custom-edge' };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  return (
    <div style={{ width: 2000, height: 1000 }}>
      <button onClick={() => setCenter(100, 100, { zoom: 2, duration: 50 })}>111</button>
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button>
      <ReactFlow
        {...props}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        fitView
        ref={reactFlowInstance}
        fitViewOptions={{
          ...defaultViewport,
        }}
      >
        <CustomControl />
      </ReactFlow>
    </div>
  );
}

function FlowWithProvider(props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
export default FlowWithProvider;
