/*
 * Copyright 2024 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
      defaultActiveKey={data?.map((item, index) => index)}
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
