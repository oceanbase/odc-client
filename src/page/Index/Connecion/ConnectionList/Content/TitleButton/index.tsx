import { batchImportPrivateConnection } from '@/common/network/connection';
import { actionTypes, canAcess } from '@/component/Acess';
import ApplyPermissionButton from '@/component/ApplyPermissionButton';
import BatchImportButton from '@/component/BatchImportButton';
import ConnectionPopover from '@/component/ConnectionPopover';
import { IConnection, IConnectionType, IManagerResourceType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import ConIcon from '@/svgr/icon_connection.svg';
import { encryptConnection } from '@/util/connection';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Empty, message, Popover, Space, Tooltip, Typography } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import { inject, observer } from 'mobx-react';
import React, { useContext, useRef } from 'react';
import ParamContext from '../../ParamContext';
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
  const { visibleScope } = useContext(ParamContext);

  const batchImportRef = useRef<{
    closeModal: () => void;
  }>();

  const handleBatchImportSubmit = async (files: UploadFile[]) => {
    const connections: IConnection[] = getResultByFiles(files);
    const data = connections?.map((item) => encryptConnection<IConnection>(item));
    const res = await batchImportPrivateConnection(data);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.Content.TitleButton.BatchImportSucceeded' }), //批量导入成功
      );
      batchImportRef.current.closeModal();
      props?.onReload();
    }
  };

  const handleFileChange = (files: UploadFile[]) => {
    return files.map((item) => {
      const res = item.response;
      if (res) {
        const result = { ...item };
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

  const canAcessApply = canAcess({
    resourceIdentifier: IManagerResourceType.public_connection,
    action: actionTypes.apply,
  }).accessible;

  const canAcessReadonly = canAcess({
    resourceIdentifier: IManagerResourceType.public_connection,
    action: actionTypes.readonlyconnect,
  }).accessible;

  const canAcessConnect = canAcess({
    resourceIdentifier: IManagerResourceType.public_connection,
    action: actionTypes.writeAndReadConnect,
  }).accessible;

  return (
    <>
      <Space>
        <Button
          type="primary"
          onClick={() => {
            const { modalStore } = props;
            modalStore.changeAddConnectionModal();
          }}
        >
          {
            formatMessage({
              id: 'odc.Content.TitleButton.CreateAPersonalConnection',
            }) /*新建个人连接*/
          }
        </Button>
        {!isClient() &&
          !props.settingStore.serverSystemInfo?.applyPermissionHidden &&
          (canAcessReadonly || canAcessConnect || canAcessApply) && <ApplyPermissionButton />}
        {enableBatchImport && visibleScope === IConnectionType.PRIVATE && (
          <BatchImportButton
            ref={batchImportRef}
            type="button"
            action="/api/v2/datasource/datasources/previewBatchImport"
            description={formatMessage({
              id: 'odc.Content.TitleButton.TheFileMustContainConnection',
            })} /*文件需包含连接类型、主机端口、租户名、数据库账号等相关连接信息，建议使用连接配置模版*/
            templateName="connection_template.xlsx"
            data={{
              visibleScope: IConnectionType.PRIVATE,
            }}
            previewContent={(data: IConnection[]) => {
              if (!data?.length) {
                return (
                  <Empty
                    description={formatMessage({
                      id: 'odc.Content.TitleButton.NoValidConnectionInformationIs',
                    })} /*暂无有效连接信息*/
                  />
                );
              }
              return (
                <>
                  {data.map((item, index) => {
                    const hasError = !!item.errorMessage;
                    return (
                      <div key={index} className={styles['pre-item']}>
                        <ConIcon style={{ marginRight: '4px' }} />
                        {hasError ? (
                          <Tooltip title={item.errorMessage}>
                            <Space size={4}>
                              <Typography.Text>{item.name}</Typography.Text>
                              <ExclamationCircleFilled
                                style={{ color: 'var(--icon-orange-color)' }}
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
        )}
      </Space>
    </>
  );
};

export default inject('settingStore', 'modalStore')(observer(TitleButton));
