import styles from './index.less';
import TraceTree from './TraceTree';
import TraceTable from './TraceTable';
import { ExpandTraceSpan } from '.';

const TraceTreeTable: React.FC<{
  innerTreeData: ExpandTraceSpan[];
  treeData: ExpandTraceSpan[];
  totalStartTimestamp: number;
  totalEndTimestamp: number;
  elapseMicroSeconds: number;
  handleNodeExpand: (key: string) => void;
  countStepBySameParentKey: (prev: string, next: string) => number;
}> = ({
  innerTreeData,
  treeData,
  totalEndTimestamp,
  totalStartTimestamp,
  elapseMicroSeconds,
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
          <div className={styles.timeStep}>{0}us</div>
          <div className={styles.timeStep}>{Math.floor(0.25 * elapseMicroSeconds)}us</div>
          <div className={styles.timeStep}>{Math.floor(0.5 * elapseMicroSeconds)}us</div>
          <div className={styles.timeStep}>
            <span>{Math.floor(0.75 * elapseMicroSeconds)}us</span>
            <span>{elapseMicroSeconds}us</span>
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
            totalStartTimestamp={totalStartTimestamp}
            totalEndTimestamp={totalEndTimestamp}
          />
        </div>
      </div>
    </div>
  );
};

export default TraceTreeTable;
