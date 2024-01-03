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

import { CheckCircleFilled } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React from 'react';

import styles from './index.less';

const ImgCheckboxGroup: React.FC<{
  options: {
    img: React.ReactNode;
    title: string;
    content: string;
    key: string;
  }[];
  onChange?: (key: string) => void;
  value?: string;
}> = (props) => {
  return (
    <Row gutter={8}>
      {props.options.map((option) => {
        const { title, content, img, key } = option;
        const isChecked = props.value == key;
        return (
          <Col
            key={key}
            onClick={() => {
              props.onChange(key);
            }}
            span={8}
          >
            <div className={`${isChecked ? styles.activeKey : ''} ${styles.item}`}>
              <div className={styles.img}>{img}</div>
              <div className={styles.right}>
                <div className={styles.title}>{title}</div>
                <div className={styles.content}>{content}</div>
              </div>
              {isChecked && (
                <CheckCircleFilled className={styles.checkicon} style={{ color: '#1890FF' }} />
              )}
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default ImgCheckboxGroup;
