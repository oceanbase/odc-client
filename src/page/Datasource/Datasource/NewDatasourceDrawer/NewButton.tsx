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

import { formatMessage } from '@/util/intl';
import {
  Button,
  Dropdown,
  Empty,
  Popover,
  Space,
  Tooltip,
  Typography,
  UploadFile,
  message,
} from 'antd';
import { useMemo, useRef, useState } from 'react';
import NewDatasourceDrawer from '.';
import { ConnectType, IConnectionType } from '@/d.ts';
import Icon, { DownOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { getAllConnectTypes, getDataSourceStyleByConnectType } from '@/common/datasource';
import { IDataSourceType, IDatasource } from '@/d.ts/datasource';
import { ConnectTypeText } from '@/constant/label';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import BatchImportButton from '@/component/BatchImportButton';
import { encryptConnection } from '@/util/connection';
import { batchImportPrivateConnection } from '@/common/network/connection';
import ConIcon from '@/svgr/icon_connection.svg';

import styles from './index.less';
import ConnectionPopover from '@/component/ConnectionPopover';
import { haveOCP } from '@/util/env';

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
const NewDatasourceButton: React.FC<{
  onSuccess: () => void;
  disableTheme?: boolean;
}> = function NewDatasourceButton(props) {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<ConnectType>(null);
  const obConnectTypes = getAllConnectTypes(IDataSourceType.OceanBase);
  const mysqlConnectTypes = getAllConnectTypes(IDataSourceType.MySQL);

  const batchImportRef = useRef<{
    closeModal: () => void;
    openModal: () => void;
  }>();
  const handleBatchImportSubmit = async (files: UploadFile[]) => {
    const connections: IDatasource[] = getResultByFiles(files);
    const data = connections?.map((item) => encryptConnection<IDatasource>(item));
    const res = await batchImportPrivateConnection(data);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.Content.TitleButton.BatchImportSucceeded',
        }), //批量导入成功
      );

      batchImportRef.current.closeModal();
      props?.onSuccess();
    }
  };

  const results: ItemType[] = useMemo(() => {
    let results: ItemType[] = obConnectTypes.map((item) => {
      return {
        label: ConnectTypeText[item],
        key: item,
        icon: (
          <Icon
            component={getDataSourceStyleByConnectType(item)?.icon?.component}
            style={{ color: getDataSourceStyleByConnectType(item)?.icon?.color, fontSize: '16px' }}
          />
        ),
      };
    });
    results.push({
      type: 'divider',
    });
    results = results.concat(
      mysqlConnectTypes.map((item) => {
        return {
          label: ConnectTypeText[item],
          key: item,
          icon: (
            <Icon
              component={getDataSourceStyleByConnectType(item)?.icon?.component}
              style={{
                color: getDataSourceStyleByConnectType(item)?.icon?.color,
                fontSize: '16px',
              }}
            />
          ),
        };
      }),
    );
    results.push({
      type: 'divider',
    });
    if (!haveOCP()) {
      results = results.concat({
        label: formatMessage({
          id: 'odc.component.BatchImportButton.BatchImport',
        }) /*批量导入*/,
        key: 'batchImport',
      });
    }
    return results;
  }, []);

  function batchImport() {
    batchImportRef.current?.openModal();
  }

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

  function newDataSource(key) {
    setType(key);
    setVisible(true);
  }
  return (
    <>
      <Dropdown
        menu={{
          items: results,
          onClick(info) {
            const key = info.key;
            if (key === 'batchImport') {
              batchImport();
              return;
            }
            newDataSource(key);
          },
        }}
      >
        {props.children || (
          <Button type="primary">
            {
              formatMessage({
                id: 'odc.Datasource.NewDatasourceDrawer.NewButton.CreateADataSource',
              }) /*新建数据源*/
            }
            <DownOutlined />
          </Button>
        )}
      </Dropdown>
      <BatchImportButton
        ref={batchImportRef}
        noButton
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
        previewContent={(data: IDatasource[]) => {
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
      <NewDatasourceDrawer
        disableTheme={props.disableTheme}
        type={type}
        visible={visible}
        close={() => setVisible(false)}
        onSuccess={props.onSuccess}
      />
    </>
  );
};

export default NewDatasourceButton;
