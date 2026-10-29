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

import React from 'react';
import { Row, Col } from 'antd';
import styles from './index.less';

interface IProps {
  data: {
    label: string;
    content: React.ReactNode;
    span?: number;
  }[];
}

const ObjectInfoView: React.FC<IProps> = function (props) {
  const { data } = props;
  return (
    <div className={styles.textFrom}>
      <Row gutter={16}>
        {data?.map(({ label, content, span = 24 }) => {
          return (
            <Col span={span}>
              <div className={styles.textFromLine}>
                <span className={styles.textFromLabel}>
                  {label}
                  {label && ':'}
                </span>
                <span className={styles.textFromContent}>{content}</span>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ObjectInfoView;
