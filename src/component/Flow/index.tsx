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
  const { dataSource } = props;

  if (!dataSource) return null;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { nodes: initialNodes, edges: initialEdges } = transformDataForReactFlow(
    dataSource?.vertexes,
    setNodes,
    setSelectedNode,
  );
  const { zoomIn, zoomOut, setCenter } = useReactFlow();
  const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

  const reactFlowInstance = useRef(null);

  // useEffect(() => {
  //   fitView();
  // }, []); // 确保只在组件挂载后调用

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNode(initialNodes[0]);
  }, []);

  useEffect(() => {
    if (!initialNodes.length) return;
    // debugger
    // if(selectedNode) return
    const newNodes = initialNodes.map((el) => {
      if (el.id === selectedNode?.id) {
        // 标记为选中
        return { ...el, data: { ...el.data, isSelected: true } };
      }
      // 移除其他节点的选中标记
      return { ...el, data: { ...el.data, isSelected: false } };
    });
    // debugger
    setNodes(newNodes);
  }, [JSON.stringify(selectedNode)]);

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
      <CustomDetailBox dataSource={nodes.find((i) => i.id === selectedNode?.id)} />
      {/* <button onClick={() => setCenter(100, 100, { zoom: 2, duration: 50 })}>111</button>
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button> */}
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
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
export default FlowWithProvider;
