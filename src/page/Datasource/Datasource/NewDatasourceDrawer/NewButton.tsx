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

import {
  getAllConnectTypes,
  getDataSourceStyleByConnectType,
  getDataSourceGroupByConnectType,
} from '@/common/datasource';
import { batchImportPrivateConnection } from '@/common/network/connection';
import BatchImportButton from '@/component/BatchImportButton';
import { ConnectTypeText, GruopTypeText } from '@/constant/label';
import { ConnectType, IConnectionType, DatasourceGroup } from '@/d.ts';
import { IDatasource, IDataSourceType } from '@/d.ts/datasource';
import { ReactComponent as ConIcon } from '@/svgr/icon_connection.svg';
import { encryptConnection } from '@/util/connection';
import { formatMessage } from '@/util/intl';
import Icon, { DownOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Empty,
  message,
  Popover,
  Space,
  Tooltip,
  Typography,
  UploadFile,
  Divider,
} from 'antd';
import { MenuItemGroupType } from 'antd/es/menu/hooks/useItems';
import { useMemo, useRef, useState } from 'react';
import { ImportOutlined } from '@ant-design/icons';
import NewDatasourceDrawer from '.';

import ConnectionPopover from '@/component/ConnectionPopover';
import { haveOCP } from '@/util/env';
import styles from './index.less';

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
  const connectTypes = [
    ...(getAllConnectTypes(IDataSourceType.OceanBase) || []),
    ...(getAllConnectTypes(IDataSourceType.MySQL) || []),
    ...(getAllConnectTypes(IDataSourceType.Doris) || []),
    ...(getAllConnectTypes(IDataSourceType.Oracle) || []),
    ...(getAllConnectTypes(IDataSourceType.PG) || []),
    ...(getAllConnectTypes(IDataSourceType.ALIYUNOSS) || []),
    ...(getAllConnectTypes(IDataSourceType.QCLOUD) || []),
    ...(getAllConnectTypes(IDataSourceType.HUAWEI) || []),
    ...(getAllConnectTypes(IDataSourceType.AWSS3) || []),
  ];

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
          defaultMessage: '批量导入成功',
        }), //批量导入成功
      );

      batchImportRef.current.closeModal();
      props?.onSuccess();
    }
  };

  const results: MenuItemGroupType[] = useMemo(() => {
    let results: MenuItemGroupType[] = Object.values(DatasourceGroup).map((item) => {
      return {
        label: GruopTypeText[item],
        key: item,
        type: 'group',
        children: [],
      };
    });
    results.forEach((at) => {
      connectTypes.forEach((item) => {
        if (getDataSourceGroupByConnectType(item) === at.key) {
          at.children.push({
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
          });
        }
      });
    });
    results = results.filter((item) => item.children.length > 0);
    return results;
  }, []);

  const customDropdownContent = useMemo(() => {
    if (haveOCP()) {
      return null;
    } else {
      return (
        <>
          <Divider style={{ margin: 0 }} />
          <Space style={{ padding: 8 }}>
            <Button type="text" icon={<ImportOutlined />} onClick={batchImport}>
              {formatMessage({
                id: 'odc.component.BatchImportButton.BatchImport',
                defaultMessage: '批量导入',
              })}
            </Button>
          </Space>
        </>
      );
    }
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
        overlayClassName={styles['new-datasource-dropdown']}
        menu={{
          items: results,
          onClick(info) {
            newDataSource(info.key);
          },
        }}
        dropdownRender={(menu) => (
          <>
            {menu}
            {customDropdownContent}
          </>
        )}
      >
        {props.children || (
          <Button type="primary">
            {
              formatMessage({
                id: 'odc.Datasource.NewDatasourceDrawer.NewButton.CreateADataSource',
                defaultMessage: '新建数据源',
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
            defaultMessage:
              '文件需包含类型、主机端口、租户名、数据库账号等相关数据源信息，建议使用数据源配置模版',
          }) /* 文件需包含类型、主机端口、租户名、数据库账号等相关数据源信息，建议使用数据源配置模版 */
        }
        templatePath="/api/v2/datasource/datasources/template"
        data={{
          visibleScope: IConnectionType.PRIVATE,
        }}
        previewContent={(data: IDatasource[]) => {
          if (!data?.length) {
            return (
              <Empty
                description={
                  formatMessage({
                    id: 'odc.src.page.Datasource.Datasource.Content.TitleButton.NoValidDataSourceInformation',
                    defaultMessage: '暂无有效数据源信息',
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
