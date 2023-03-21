import { Skeleton } from 'antd';
import React from 'react';

interface IProps {}

const LoadingItem: React.FC<IProps> = function () {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Skeleton paragraph={{ rows: 0 }} title={{ width: 'calc(100% - 100px)' }} active />
    </div>
  );
};

export default LoadingItem;
