import { useCallback, useState } from 'react';
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
            className={classNames(styles.node, {
              [styles.active]: data?.isSelected,
            })}
            style={{
              height: 82,
              width: 260,
              bottom: '-8px',
              left: '8px',
            }}
          >
            2
          </div>
          <div
            className={classNames(styles.node, {
              [styles.active]: data?.isSelected,
            })}
            style={{
              height: 84,
              width: 270,
              bottom: '-4px',
              left: '4px',
            }}
          >
            3
          </div>
        </>
      ) : null}
      <div
        className={classNames(styles.node, {
          [styles.active]: data?.isSelected,
        })}
        style={{
          bottom: '0px',
          height: 90,
          width: 280,
        }}
        onClick={() => {
          data?.setSelectedNode(data);
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'inline-flex', maxWidth: '50%' }}>
            <Tooltip title={data.label}>
              <div
                style={{
                  fontWeight: 500,
                  textWrap: 'nowrap',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.label}
              </div>
            </Tooltip>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>[{data?.id}]</div>
          </span>
          <span style={{ textWrap: 'nowrap' }}>
            {formatTimeTemplate(BigNumber(data?.duration).div(1000000).toNumber())}{' '}
            {data && data.percentage === '' ? '' : `(${data?.percentage}%)`}
          </span>
        </div>
        <div
          style={{
            color: 'rgba(0,0,0,0.45)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textWrap: 'nowrap',
          }}
          title={data?.title}
        >
          {data?.title || '-'}
        </div>
        {data.percentage === '' ? (
          <div></div>
        ) : (
          <Progress percent={data?.percentage} showInfo={false}></Progress>
        )}
        {data?.hasChild ? (
          <div
            style={{
              position: 'absolute',
              bottom: data?.subNodes ? '-33px' : '-25px',
              left: '129px',
              padding: 4,
            }}
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
