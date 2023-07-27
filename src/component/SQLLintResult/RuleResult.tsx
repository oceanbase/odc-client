import { IRule } from '@/d.ts/rule';
import { RenderLevel } from '@/page/Secure/Env/components/InnerEnvironment';
import { Collapse, Space } from 'antd';
import React from 'react';
import styles from './index.less';

const { Panel } = Collapse;

interface IProps {
  data: IRule[];
}

const RuleResult: React.FC<IProps> = function ({ data }) {
  if (!data?.length) {
    return null;
  }
  return (
    <Space direction="vertical">
      {data.map((item) => {
        return (
          <div className={styles.item}>
            <RenderLevel level={item?.level} />
            <div className={styles.desc}>{item.metadata?.name}</div>
          </div>
        );
      })}
    </Space>
  );
};

export default RuleResult;
