import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

const handleStyle = { left: 10 };

function TextUpdaterNode({ data, id, isConnectable }) {
  const onClick = useCallback((evt) => {
    // data里要有id
    console.log(IDBCursor);
  }, []);

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div
        style={{
          height: 90,
          width: 200,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 2,
        }}
        onClick={() => {
          console.log('hjkl');
        }}
      >
        {' '}
        {data.label}
        {data.hasChild && (
          <div
            style={{
              position: 'absolute',
              bottom: '-26px',
              left: '90px',
              padding: 4,
              backgroundColor: 'var(--neutral-grey3-color)',
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
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}

export default TextUpdaterNode;
