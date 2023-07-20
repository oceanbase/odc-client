import { RenderLevel } from '@/page/Secure/Env/components/InnerEnvironment';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Space, Tooltip, Typography } from 'antd';
import React from 'react';
import styles from './index.less';
import { ISQLLintReuslt } from './type';

const { Panel } = Collapse;

interface IProps {
  data: ISQLLintReuslt[];
}

const SQLLintResult: React.FC<IProps> = function ({ data }) {
  if (!data) {
    return null;
  }
  return (
    <Collapse
      className={styles.collapse}
      ghost
      defaultActiveKey={[0, 1, 2, 3, 4, 5]}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      {data?.map?.((item, index) => {
        return (
          <Panel
            header={
              <Tooltip title={item.sql}>
                <Typography.Paragraph
                  style={{ marginBottom: 0, color: 'var(--text-color-inverse)' }}
                  ellipsis={{ rows: 2 }}
                >
                  {item.sql}
                </Typography.Paragraph>
              </Tooltip>
            }
            key={index}
          >
            <Space direction="vertical">
              {item.violations.map((item) => {
                return (
                  <div className={styles.item}>
                    <RenderLevel level={item?.level} />
                    <div className={styles.desc}>{item.localizedMessage}</div>
                  </div>
                );
              })}
            </Space>
          </Panel>
        );
      })}
    </Collapse>
  );
};

export default SQLLintResult;
