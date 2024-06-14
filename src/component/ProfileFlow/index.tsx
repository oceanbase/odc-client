import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import CustomEdge from './customComponents/Edge';
import CustomNode from './customComponents/Node';
import CustomControl from './customComponents/Control';
import CustomDetailBox from './customComponents/DetailBox';
import { transformDataForReactFlow, initCenter, handleSelectNode } from './utils';
import { REACT_FLOW_ID, CPU_TIME, IO_WAIT_TIME } from './constant';
import { IProfileGraph } from '@/d.ts';
import styles from './index.less';
import 'reactflow/dist/style.css';

const edgeTypes = { CustomEdge: CustomEdge };
const nodeTypes = { customNode: CustomNode };

interface Iprops {
  dataSource: IProfileGraph;
}

function Flow(props: Iprops) {
  const { dataSource } = props;
  if (!dataSource) return null;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { setCenter, setViewport } = useReactFlow();

  const {
    nodes: initialNodes,
    edges: initialEdges,
    nodeDurationSum,
  } = transformDataForReactFlow(
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
  }, [JSON.stringify(dataSource)]);

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
      const edge = { ...connection, type: 'CustomEdge' };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  return (
    <div className={styles.profileFlow}>
      <CustomDetailBox
        dataSource={nodes.find((i) => i.id === selectedNode?.id)}
        topNodes={dataSource?.topNodes}
        initialNodes={initialNodes}
        globalInfo={{
          duration: dataSource.duration,
          overview: dataSource.overview,
          statistics: dataSource.statistics,
          percent: dataSource?.overview
            ? (Number(dataSource?.overview?.[CPU_TIME]) /
                (Number(dataSource?.overview?.[CPU_TIME]) +
                  Number(dataSource?.overview?.[IO_WAIT_TIME]))) *
              100
            : 100,
        }}
      />
      <ReactFlow
        id={REACT_FLOW_ID}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // @ts-ignore
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        ref={reactFlowInstance}
        onElementClick={(event, element) => {
          setSelectedNode(element);
        }}
        onPaneClick={() => setSelectedNode(null)}
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
