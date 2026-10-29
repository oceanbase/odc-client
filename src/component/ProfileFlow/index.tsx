/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IProfileGraph } from '@/d.ts';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CPU_TIME, IO_WAIT_TIME, REACT_FLOW_ID } from './constant';
import CustomControl from './customComponents/Control';
import CustomDetailBox from './customComponents/DetailBox';
import CustomEdge from './customComponents/Edge';
import CustomNode from './customComponents/Node';
import styles from './index.less';
import { handleSelectNode, initCenter, transformDataForReactFlow } from './utils';

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
    setTimeout(() => {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }, 300);
  }, [JSON.stringify(initialNodes)]);

  // 视图位置初始化
  useEffect(() => {
    initCenter(setCenter);
  }, [setCenter]);

  // 选择的高亮
  useEffect(() => {
    handleSelectNode(setNodes, selectedNode?.id);
  }, [JSON.stringify(selectedNode?.id)]);

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
