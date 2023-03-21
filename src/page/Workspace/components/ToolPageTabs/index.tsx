/**
 * 任意对象详情页的tabs组件，主要包含了ODC的统一定制样式
 */
import { Tabs } from 'antd';
import React from 'react';
import styles from './index.less';

interface IProps {
  activeKey: string;
  onChange: () => void;
}

const ToolPageTabs: React.FC<IProps> = (props) => {
  const { activeKey, onChange } = props;
  return (
    <Tabs activeKey={activeKey} tabPosition="left" className={styles.propsTab} onChange={onChange}>
      {props.children}
    </Tabs>
  );
};

export default ToolPageTabs;
