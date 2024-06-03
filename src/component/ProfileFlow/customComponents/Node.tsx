import { Handle, Position } from 'reactflow';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Progress, Tooltip } from 'antd';
import styles from './index.less';
import classNames from 'classnames';
import { formatTimeTemplate } from '@/util/utils';
import BigNumber from 'bignumber.js';

function TextUpdaterNode({ data, id, isConnectable }) {
  return (
    <div className={styles.customNodes}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
      {data?.subNodes ? (
        <>
          <div
            className={classNames(styles.node, styles.nodeOverlap1, {
              [styles.active]: data?.isSelected,
            })}
          ></div>
          <div
            className={classNames(styles.node, styles.nodeOverlap2, {
              [styles.active]: data?.isSelected,
            })}
          ></div>
        </>
      ) : null}
      <div
        className={classNames(styles.node, styles.nodeOverlap3, {
          [styles.active]: data?.isSelected,
        })}
        onClick={() => {
          data?.setSelectedNode(data);
        }}
      >
        <div className={styles.nodeHeader}>
          <span className={styles.titleBox}>
            <Tooltip title={data.label}>
              <div className={styles.title}>{data.label}</div>
            </Tooltip>
            <div className={styles.number}>[{data?.id}]</div>
          </span>
          <span className={styles.params}>
            {formatTimeTemplate(BigNumber(data?.duration).div(1000000).toNumber())}{' '}
            {data && data.percentage === '' ? '' : `(${data?.percentage}%)`}
          </span>
        </div>
        <div className={styles.subTitle} title={data?.title}>
          {data?.title || '-'}
        </div>
        {data.percentage === '' ? (
          <div></div>
        ) : (
          <Progress percent={data?.percentage} showInfo={false}></Progress>
        )}
        {data?.hasChild ? (
          <div
            className={styles.icon}
            style={{ bottom: data?.subNodes ? '-33px' : '-25px' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              data?.changeTreeOpen(id, data.isTreeOpen);
            }}
          >
            {data.isTreeOpen ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
          </div>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
}

export default TextUpdaterNode;
