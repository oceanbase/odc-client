import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

const handleStyle = { left: 10 };

function TextUpdaterNode({ data, id, isConnectable }) {
  // debugger
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
          padding: '12px 16px 16px 16px',
          border: data?.isSelected
            ? '2px solid rgba(24,144,255,0.20)'
            : '1px solid rgba(0,0,0,0.12)',
        }}
        onClick={() => data?.setSelectedNode(data)}
      >
        {' '}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {data.label}[{data?.id}]
          </span>
          <span>{data?.overview?.['DB Time']}(?%)</span>
        </div>
        {data.hasChild && (
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
        )}
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
