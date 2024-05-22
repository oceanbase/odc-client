import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Progress, Tooltip } from 'antd';

function TextUpdaterNode({ data, id, isConnectable }) {
  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
      <div
        style={{
          height: 90,
          width: 280,
          backgroundColor: '#FFFFFF',
          borderRadius: 2,
          padding: '12px 16px',
          border: data?.isSelected
            ? '2px solid rgba(24,144,255,0.20)'
            : '1px solid rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        onClick={() => {
          data?.setSelectedNode(data);
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'inline-flex' }}>
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
            {data?.overview?.['DB Time']}{' '}
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
              bottom: '-25px',
              left: '130px',
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
