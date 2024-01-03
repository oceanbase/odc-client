/*
 * Copyright 2024 OceanBase
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
        overflow: 'scroll hidden',
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
