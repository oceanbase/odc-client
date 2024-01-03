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

import YamlEditor from '@/component/YamlEditor';
import type { IManagerIntegration } from '@/d.ts';
import { IManagerDetailTabs } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space } from 'antd';
import React from 'react';
import styles from '../../index.less';

const Detail: React.FC<{
  title: string;
  data: IManagerIntegration;
}> = ({ title, data }) => {
  const {
    name,
    enabled,
    description,
    encryption,
    creatorName,
    createTime,
    updateTime,
    configuration,
  } = data;

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage(
              {
                id: 'odc.component.DetailContent.TitleName',
              },
              { title: title },
            ) //`${title}名称`
          }
        >
          {name}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage(
              {
                id: 'odc.component.DetailContent.TitleStatus',
              },
              { title: title },
            ) //`${title}状态`
          }
        >
          {
            enabled
              ? formatMessage({ id: 'odc.component.DetailContent.Enable.1' }) //启用
              : formatMessage({ id: 'odc.component.DetailContent.Disable' }) //停用
          }
        </Descriptions.Item>
        <Descriptions.Item>
          {
            formatMessage(
              {
                id: 'odc.component.DetailContent.TitleConfiguration',
              },
              { title: title },
            ) //`${title}配置`
          }
        </Descriptions.Item>
        <Descriptions.Item>
          <div className={styles.editor}>
            <YamlEditor defaultValue={configuration} readOnly />
          </div>
        </Descriptions.Item>
        {
          <Descriptions.Item>
            <Space direction="vertical" size={5} className={styles['block-wrapper']}>
              <Space>
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.DetailContent.EncryptionStatus',
                    }) /*加密状态*/
                  }
                </span>
                <span>
                  {
                    encryption?.enabled
                      ? formatMessage({ id: 'odc.component.DetailContent.Enable.1' }) //启用
                      : formatMessage({ id: 'odc.component.DetailContent.NotEnabled' }) //未启用
                  }
                </span>
              </Space>
              {encryption?.enabled && (
                <Space className={styles.block} split=":">
                  <span>
                    {
                      formatMessage({
                        id: 'odc.component.DetailContent.EncryptionAlgorithm',
                      }) /*加密算法*/
                    }
                  </span>
                  <span>{encryption?.algorithm}</span>
                </Space>
              )}
            </Space>
          </Descriptions.Item>
        }

        <Descriptions.Item
          label={formatMessage({ id: 'odc.component.DetailContent.Remarks' })} /*备注*/
        >
          {description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({ id: 'odc.component.DetailContent.Founder' })} /*创建人*/
        >
          {creatorName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({ id: 'odc.component.DetailContent.CreationTime' })} /*创建时间*/
        >
          {getLocalFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({ id: 'odc.component.DetailContent.UpdateTime' })} /*更新时间*/
        >
          {getLocalFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
const DetailContent: React.FC<{
  title: string;
  activeKey: IManagerDetailTabs;
  data: IManagerIntegration;
  handleCloseAndReload: () => void;
}> = ({ activeKey, ...rest }) => {
  return <Detail {...rest} />;
};

export default DetailContent;
