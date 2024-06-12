import { IConnection, IConnectionStatus } from '@/d.ts';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { Button, Divider, Form, Space, Timeline, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { listDatabases } from '@/common/network/database';
import { useRequest } from 'ahooks';
import _ from 'lodash';
import InnerSelecter, { DatabaseOption } from './InnerSelecter';
import { DatabasePermissionType } from '@/d.ts/database';
import { SelectTemplate, CreateTemplate } from '../components/Template';
import datasourceStatus from '@/store/datasourceStatus';
import styles from './index.less';

export const DatabaseQueueSelect: React.FC<{
  rootName: (number | string)[];
  multipleDatabaseChangeOpen: boolean;
  setDefaultDatasource: React.Dispatch<React.SetStateAction<IConnection>>;
}> = ({ rootName, multipleDatabaseChangeOpen, setDefaultDatasource }) => {
  const form = Form.useFormInstance();
  const projectId = Form.useWatch('projectId', form);
  const [databaseIdMap, setDatabaseIdMap] = useState<Map<number, boolean>>(new Map());
  const [databaseOptions, setDatabaseOptions] = useState<DatabaseOption[]>([]);
  const {
    data,
    run,
    loading: fetchLoading,
  } = useRequest(listDatabases, {
    manual: true,
  });
  const loadDatabaseList = async (projectId: number) => {
    const databaseList = await run(
      projectId,
      null,
      1,
      99999,
      null,
      null,
      login.isPrivateSpace(),
      true,
      true,
    );
    const checkDbExpiredByDataSourceStatus = (status: IConnectionStatus) => {
      switch (status) {
        case IConnectionStatus.ACTIVE: {
          return false;
        }
        case IConnectionStatus.TESTING:
        case IConnectionStatus.NOPASSWORD:
        case IConnectionStatus.DISABLED:
        case IConnectionStatus.INACTIVE:
        default: {
          return true;
        }
      }
    };
    setDatabaseOptions(
      databaseList?.contents?.map((item) => {
        const statusInfo = datasourceStatus.statusMap.get(item?.dataSource?.id);
        return {
          label: item?.name,
          value: item?.id,
          environment: item?.environment,
          dataSource: item?.dataSource,
          existed: item?.existed,
          unauthorized: !item?.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE),
          expired: checkDbExpiredByDataSourceStatus(statusInfo?.status),
        };
      }),
    );
    if (databaseList?.contents?.length) {
      setDefaultDatasource(databaseList?.contents?.[0]?.dataSource);
    }
    databaseList?.contents?.forEach((db) => {
      databaseIdMap.set(db.id, false);
    });
    setDatabaseIdMap(databaseIdMap);
  };

  useEffect(() => {
    if (multipleDatabaseChangeOpen && projectId) {
      loadDatabaseList(projectId);
    }
  }, [projectId]);
  return (
    <div className={styles.orderedDatabaseIds}>
      <Form.List name={['parameters', 'orderedDatabaseIds']}>
        {(fields, { add, remove }, { errors }) => (
          <>
            <Timeline>
              {fields?.map(({ key, name, ...restField }, index) => (
                <Timeline.Item
                  className={styles.timelineItem}
                  key={['databaseIds', key, index]?.join(',')}
                >
                  <Form.List name={[name]}>
                    {(innerFields, { add: innerAdd, remove: innerRemove }) => (
                      <DndProvider backend={HTML5Backend} key={index}>
                        <div
                          key={[key, index, 'inner']?.join(',')}
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              width: '444px',
                              height: '20px',
                              lineHeight: '20px',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              className={styles.title}
                              style={{ flexShrink: 0, alignSelf: 'center' }}
                            >
                              {formatMessage(
                                {
                                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.6E409607',
                                  defaultMessage: '执行节点${index + 1}',
                                },
                                { BinaryExpression0: index + 1 },
                              )}
                            </div>
                            <Divider
                              style={{
                                flex: 1,
                                padding: 0,
                                margin: 0,
                                alignSelf: 'center',
                                height: 1,
                                width: 284,
                                minWidth: 0,
                                maxWidth: 284,
                              }}
                            />

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                columnGap: '8px',
                              }}
                            >
                              <PlusOutlined onClick={() => innerAdd(undefined)} />
                              <UpOutlined
                                style={{
                                  color: index === 0 ? 'var(--mask-color)' : null,
                                  cursor: index === 0 ? 'not-allowed' : null,
                                }}
                                onClick={async () => {
                                  if (index === 0) {
                                    return;
                                  }
                                  const data = await form.getFieldsValue();
                                  const orderedDatabaseIds =
                                    data?.parameters?.orderedDatabaseIds ?? [];
                                  const [pre, next] = orderedDatabaseIds?.slice(
                                    index - 1,
                                    index + 1,
                                  );
                                  orderedDatabaseIds?.splice(index - 1, 2, next, pre);
                                  form.setFieldValue(rootName, orderedDatabaseIds);
                                }}
                              />

                              <DownOutlined
                                style={{
                                  color: index === fields?.length - 1 ? 'var(--mask-color)' : null,
                                  cursor: index === fields?.length - 1 ? 'not-allowed' : null,
                                }}
                                onClick={async () => {
                                  if (index === fields?.length - 1) {
                                    return;
                                  }
                                  const data = await form.getFieldsValue();
                                  const orderedDatabaseIds =
                                    data?.parameters?.orderedDatabaseIds ?? [];
                                  const [pre, next] = orderedDatabaseIds?.slice(index, index + 2);
                                  orderedDatabaseIds?.splice(index, 2, next, pre);
                                  form.setFieldValue(rootName, orderedDatabaseIds);
                                }}
                              />

                              <DeleteOutlined onClick={() => remove(name)} />
                            </div>
                          </div>
                          <InnerSelecter
                            rootName={rootName}
                            disabled={!projectId}
                            outerName={name}
                            innerFields={innerFields}
                            innerRemove={innerRemove}
                            databaseOptions={databaseOptions}
                          />
                        </div>
                      </DndProvider>
                    )}
                  </Form.List>
                </Timeline.Item>
              ))}
              <Timeline.Item className={styles.timelineItem}>
                <Button
                  type="link"
                  style={{
                    padding: 0,
                    margin: 0,
                    lineHeight: '20px',
                    height: '20px',
                  }}
                  onClick={() => add([undefined])}
                  icon={<PlusOutlined />}
                >
                  {formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.0CDA8962',
                    defaultMessage: '添加执行节点',
                  })}
                </Button>
              </Timeline.Item>
            </Timeline>
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
    </div>
  );
};

const DatabaseQueue: React.FC<{
  multipleDatabaseChangeOpen: boolean;
  setDefaultDatasource: React.Dispatch<React.SetStateAction<IConnection>>;
}> = ({ multipleDatabaseChangeOpen, setDefaultDatasource }) => {
  const form = Form.useFormInstance();
  const projectId = Form.useWatch('projectId', form);
  const [createTemplateModalOpen, setCreateTemplateModalOpen] = useState<boolean>(false);
  const [selectTemplateModalOpen, setSelectTemplateModalOpen] = useState<boolean>(false);
  const [manageTemplateModalOpen, setManageTemplateModalOpen] = useState<boolean>(false);
  return (
    <Form.Item
      label={formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.A608B8E7',
        defaultMessage: '数据库',
      })}
      requiredMark
      shouldUpdate={true}
    >
      <div className={styles.header}>
        <div className={styles.tip}>
          {formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.CreateModal.50FF5C74',
            defaultMessage:
              '选择库并设置执行顺序；不同节点将依次执行变更，同一节点内的库将同时变更',
          })}
        </div>
        <Space split="|">
          <Tooltip
            title={
              !Boolean(projectId)
                ? formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.C7B17105',
                    defaultMessage: '请先选择项目',
                  })
                : null
            }
          >
            <Button
              disabled={!Boolean(projectId)}
              className={styles.linkBtn}
              style={{
                padding: 0,
                margin: 0,
              }}
              type="link"
              onClick={() => {
                setCreateTemplateModalOpen(true);
              }}
            >
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.A95292C7',
                defaultMessage: '保存模版',
              })}
            </Button>
          </Tooltip>
          <SelectTemplate
            key={'selectTemplate'}
            manageTemplateModalOpen={manageTemplateModalOpen}
            setManageTemplateModalOpen={setManageTemplateModalOpen}
            selectTemplateModalOpen={selectTemplateModalOpen}
            setSelectTemplateModalOpen={setSelectTemplateModalOpen}
          />
        </Space>
        <CreateTemplate
          form={form}
          createTemplateModalOpen={createTemplateModalOpen}
          setCreateTemplateModalOpen={setCreateTemplateModalOpen}
        />
      </div>
      <DatabaseQueueSelect
        rootName={['parameters', 'orderedDatabaseIds']}
        setDefaultDatasource={setDefaultDatasource}
        multipleDatabaseChangeOpen={multipleDatabaseChangeOpen}
      />
    </Form.Item>
  );
};
export default DatabaseQueue;
