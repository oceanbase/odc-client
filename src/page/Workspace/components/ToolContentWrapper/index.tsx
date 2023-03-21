/**
 * 任意对象详情页 Toolbar区块下面的容器组件，主要包含了高度计算样式
 */
import React from 'react';

const ToolContentWrapper: React.FC<{}> = (props) => {
  return <div style={{ height: `calc(100vh - ${40 + 28 + 39}px)` }}>{props.children}</div>;
};

export default ToolContentWrapper;
