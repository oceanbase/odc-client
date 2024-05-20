import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import CustomEdge from './customComponents/CustomEdge';
import CustomNode from './customComponents/CustomNode';
import CustomControl from './customComponents/CustomControl';
import CustomDetailBox from './customComponents/CustomDetailBox';
import { transformDataForReactFlow, initCenter, handleSelectNode } from './utils';
import { REACT_FLOW_ID } from './constant';

import 'reactflow/dist/style.css';

const edgeTypes = { 'custom-edge': CustomEdge };

const nodeTypes = { customNode: CustomNode };

function Flow(props) {
  const { dataSource } = props;
  if (!dataSource) return null;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const { zoomIn, zoomOut, setCenter, setViewport } = useReactFlow();

  const { nodes: initialNodes, edges: initialEdges } = transformDataForReactFlow(
    dataSource?.vertexes,
    dataSource?.duration,
    setNodes,
    setSelectedNode,
    setViewport,
  );

  const reactFlowInstance = useRef(null);

  // 初始化数据
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // 视图位置初始化
  useEffect(() => {
    initCenter(setCenter);
  }, [setCenter]);

  // 选择的高亮
  useEffect(() => {
    handleSelectNode(setNodes, selectedNode?.id);
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
        overflowX: 'auto',
        backgroundColor: 'rgba(0,0,0,0.02)',
        border: '1px solid #E0E0E0',
        width: 'calc(100% - 320px)',
        minWidth: '960px',
      }}
    >
      <CustomDetailBox
        dataSource={nodes.find((i) => i.id === selectedNode?.id)}
        topNodes={dataSource?.topNodes}
        initialNodes={initialNodes}
      />
      <ReactFlow
        id={REACT_FLOW_ID}
        {...props}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        ref={reactFlowInstance}
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
