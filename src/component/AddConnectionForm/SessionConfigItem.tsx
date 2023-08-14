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

import Helpdoc from '@/component/helpDoc';
import { formatMessage } from '@/util/intl';
import { Form, InputNumber } from 'antd';
import React from 'react';

interface IProps {
  onlySys: boolean;
}

const SessionConfigItem: React.FC<IProps> = function (props) {
  const { onlySys } = props;
  return (
    <>
      <Form.Item
        required
        label={
          <Helpdoc isTip leftText doc="sessionTimeTip">
            {
              formatMessage({
                id: 'odc.component.AddConnectionForm.SessionConfigItem.SqlQueryTimeout',
              }) /*SQL 查询超时*/
            }
          </Helpdoc>
        }
        name="queryTimeoutSeconds"
        rules={[
          {
            max: 2147484,
            message: formatMessage({
              id: 'odc.AddConnectionDrawer.AddConnectionForm.TheMaximumValueIs',
            }),

            // 超过最大值2147484限制
            type: 'number',
          },
        ]}
      >
        <InputNumber<number | string>
          disabled={onlySys}
          formatter={(value) => {
            return (
              (value || '') +
              formatMessage({
                id: 'odc.AddConnectionDrawer.AddConnectionForm.Seconds',
              })
            );
          }}
          parser={(value) =>
            value.replace(
              formatMessage({
                id: 'odc.AddConnectionDrawer.AddConnectionForm.Seconds',
              }),

              '',
            )
          }
          min={1}
          style={{
            width: 110,
          }}
          placeholder={formatMessage({
            id: 'odc.AddConnectionDrawer.AddConnectionForm.Enter',
          })}
        />
      </Form.Item>
    </>
  );
};

export default SessionConfigItem;
