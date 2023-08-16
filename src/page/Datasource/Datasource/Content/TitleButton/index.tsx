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

import { batchImportPrivateConnection } from '@/common/network/connection';
import { Acess, createPermission } from '@/component/Acess';
import BatchImportButton from '@/component/BatchImportButton';
import ConnectionPopover from '@/component/ConnectionPopover';
import { actionTypes, IConnection, IConnectionType, IManagerResourceType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import ConIcon from '@/svgr/icon_connection.svg';
import { encryptConnection } from '@/util/connection';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Empty, message, Popover, Space, Tooltip, Typography } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import { inject, observer } from 'mobx-react';
import React, { useRef } from 'react';
import NewDatasourceButton from '../../NewDatasourceDrawer/NewButton';
import styles from '../index.less';
const enableBatchImport = true;
const getResultByFiles = (files: UploadFile[]) => {
  const res = [];
  files
    ?.filter((file) => file?.status === 'done')
    ?.forEach((file) => {
      file?.response?.data?.batchImportConnectionList?.map((item) => {
        res.push(item);
      });
    });
  return res;
};
interface IProps {
  settingStore?: SettingStore;
  modalStore?: ModalStore;
  onReload?: () => void;
}
const TitleButton: React.FC<IProps> = function (props) {
  const batchImportRef = useRef<{
    closeModal: () => void;
  }>();
  const handleBatchImportSubmit = async (files: UploadFile[]) => {
    const connections: IConnection[] = getResultByFiles(files);
    const data = connections?.map((item) => encryptConnection<IConnection>(item));
    const res = await batchImportPrivateConnection(data);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.Content.TitleButton.BatchImportSucceeded',
        }), //批量导入成功
      );

      batchImportRef.current.closeModal();
      props?.onReload();
    }
  };
  const handleFileChange = (files: UploadFile[]) => {
    return files.map((item) => {
      const res = item.response;
      if (res) {
        const result = {
          ...item,
        };
        const errorMessage = res?.data?.errorMessage;
        if (errorMessage) {
          result.status = 'error';
          result.response = errorMessage;
        }
        return result;
      }
      return item;
    });
  };
  return (
    <>
      <Space>
        <Acess {...createPermission(IManagerResourceType.resource, actionTypes.create)}>
          <NewDatasourceButton
            onSuccess={() => {
              props.onReload();
            }}
          />
        </Acess>
        <Acess {...createPermission(IManagerResourceType.resource, actionTypes.create)}>
          <BatchImportButton
            ref={batchImportRef}
            type="button"
            action="/api/v2/datasource/datasources/previewBatchImport"
            description={
              formatMessage({
                id: 'odc.src.page.Datasource.Datasource.Content.TitleButton.TheFileNeedsToInclude',
              }) /* 文件需包含类型、主机端口、租户名、数据库账号等相关数据源信息，建议使用数据源配置模版 */
            }
            templateName="datasource_template.xlsx"
            data={{
              visibleScope: IConnectionType.PRIVATE,
            }}
            previewContent={(data: IConnection[]) => {
              if (!data?.length) {
                return (
                  <Empty
                    description={
                      formatMessage({
                        id:
                          'odc.src.page.Datasource.Datasource.Content.TitleButton.NoValidDataSourceInformation',
                      }) /* 暂无有效数据源信息 */
                    }
                  />
                );
              }
              return (
                <>
                  {data.map((item, index) => {
                    const hasError = !!item.errorMessage;
                    return (
                      <div key={index} className={styles['pre-item']}>
                        <ConIcon
                          style={{
                            marginRight: '4px',
                          }}
                        />
                        {hasError ? (
                          <Tooltip title={item.errorMessage}>
                            <Space size={4}>
                              <Typography.Text>{item.name}</Typography.Text>
                              <ExclamationCircleFilled
                                style={{
                                  color: 'var(--icon-orange-color)',
                                }}
                              />
                            </Space>
                          </Tooltip>
                        ) : (
                          <Popover
                            overlayClassName={styles.connectionPopover}
                            placement="right"
                            content={<ConnectionPopover connection={item} showType={false} />}
                          >
                            <Typography.Text>{item.name}</Typography.Text>
                          </Popover>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            }}
            getResultByFiles={getResultByFiles}
            onChange={handleFileChange}
            onSubmit={handleBatchImportSubmit}
          />
        </Acess>
      </Space>
    </>
  );
};
export default inject('settingStore', 'modalStore')(observer(TitleButton));
