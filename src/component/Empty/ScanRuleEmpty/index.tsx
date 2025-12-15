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

import { Acess, createPermission } from '@/component/Acess';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Empty } from 'antd';
import styles from './index.less';

export default function ScanRuleEmpty({ showActionButton }) {
  return (
    <Acess
      fallback={
        <Empty
          description={
            formatMessage({ id: 'odc.src.page.Secure.RiskLevel.components.NoRule' }) /* 暂无规则 */
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            flexGrow: 1,
          }}
        />
      }
      {...createPermission(IManagerResourceType.risk_detect, actionTypes.create)}
    >
      <div className={styles.scanRuleEmptyWrapper}>
        <Empty
          description={
            <div>
              <div>
                {formatMessage({
                  id: 'src.component.Empty.ScanRuleEmpty.1A1158CB',
                  defaultMessage: '风险识别规则是通过表达式配置的规则，会决定工单的审批流程。',
                })}
              </div>
              <div>
                {formatMessage({
                  id: 'src.component.Empty.ScanRuleEmpty.E341691D',
                  defaultMessage:
                    '如：「环境 等于 生产」将会匹配在「生产」环境中执行的工单，并执行对应的审批流程',
                })}
              </div>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {showActionButton()}
        </Empty>
      </div>
    </Acess>
  );
}
