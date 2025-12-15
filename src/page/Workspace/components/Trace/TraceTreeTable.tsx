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

import styles from './index.less';
import TraceTree from './TraceTree';
import TraceTable from './TraceTable';
import { ExpandTraceSpan } from '.';
import { formatTimeTemplatMicroSeconds } from '@/util/data/dateTime';

const TraceTreeTable: React.FC<{
  innerTreeData: ExpandTraceSpan[];
  treeData: ExpandTraceSpan[];
  totalStartTimestamp: number;
  totalEndTimestamp: number;
  totalElapseMicroSeconds: number;
  handleNodeExpand: (key: string) => void;
  countStepBySameParentKey: (prev: string, next: string) => number;
}> = ({
  innerTreeData,
  treeData,
  totalEndTimestamp,
  totalStartTimestamp,
  totalElapseMicroSeconds,
  handleNodeExpand,
  countStepBySameParentKey,
}) => {
  return (
    <div className={styles.traceTreeTable}>
      <div className={styles.traceTreeTableHeader}>
        <div className={styles.headerSpanID}>
          <span className={styles.headerSpanIDSpan}>Span</span>
        </div>
        <div className={styles.stepContainer}>
          <div className={styles.timeStep}>0 us</div>
          <div className={styles.timeStep}>
            {formatTimeTemplatMicroSeconds(Math.floor(0.25 * totalElapseMicroSeconds))}
          </div>
          <div className={styles.timeStep}>
            {formatTimeTemplatMicroSeconds(Math.floor(0.5 * totalElapseMicroSeconds))}
          </div>
          <div className={styles.timeStep}>
            <span>{formatTimeTemplatMicroSeconds(Math.floor(0.75 * totalElapseMicroSeconds))}</span>
            <span>{formatTimeTemplatMicroSeconds(totalElapseMicroSeconds)}</span>
          </div>
        </div>
      </div>
      <div className={styles.traceTreeTableBody}>
        <div className={styles.tableBodyContent}>
          <TraceTree
            treeData={treeData}
            handleNodeExpand={handleNodeExpand}
            countStepBySameParentKey={countStepBySameParentKey}
            totalEndTimestamp={totalEndTimestamp}
            totalStartTimestamp={totalStartTimestamp}
          />
          <TraceTable
            innerTreeData={innerTreeData}
            totalElapseMicroSeconds={totalElapseMicroSeconds}
            totalStartTimestamp={totalStartTimestamp}
          />
        </div>
      </div>
    </div>
  );
};

export default TraceTreeTable;
