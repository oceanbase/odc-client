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

import RiskLevelLabel from '@/component/RiskLevelLabel';
import { formatMessage } from '@/util/intl';
import { Descriptions, Space } from 'antd';
import styles from './index.less';

const EnvironmentInfo = ({ label, style, description }) => {
  return (
    <>
      <Space className={styles.tag}>
        <div className={styles.tagLabel}>
          {formatMessage({ id: 'odc.Env.components.InnerEnvironment.LabelStyle' }) /*标签样式:*/}
        </div>
        <RiskLevelLabel content={label} color={style} />
      </Space>
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.Env.components.InnerEnvironment.Description' }) //描述
          }
        >
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default EnvironmentInfo;
