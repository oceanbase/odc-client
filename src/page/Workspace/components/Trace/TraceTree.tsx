import React from 'react';
import Node from './Node';
import { ExpandTraceSpan } from '.';

const TraceTree: React.FC<
  {
    treeData: ExpandTraceSpan[];
    totalStartTimestamp: number;
    totalEndTimestamp: number;
    handleNodeExpand: (key: string) => void;
    countStepBySameParentKey: (prev: string, next: string) => number;
  } & Partial<ExpandTraceSpan>
> = ({ treeData, handleNodeExpand, countStepBySameParentKey }) => {
  return (
    <div
      style={{
        width: '288px',
        background: 'var(--neutral-grey2-color)',
        border: '1px solid var(--odc-border-color)',
        borderTop: 'none',
        borderBottom: 'none',
      }}
    >
      {treeData.length > 0 &&
        treeData?.map((td, index) => {
          return (
            <Node
              key={index}
              {...td}
              handleNodeExpand={handleNodeExpand}
              lastOne={treeData?.length - 1 === index}
              countStepBySameParentKey={countStepBySameParentKey}
            />
          );
        })}
    </div>
  );
};
export default TraceTree;
