import { formatMessage } from '@/util/intl';
import { Template, getTemplateList, deleteTemplate } from '@/common/network/databaseChange';
import CommonTable from '@/component/CommonTable';
import { ITableLoadOptions } from '@/component/CommonTable/interface';
import login from '@/store/login';
import { message, Popover, Space, Drawer, Descriptions, Popconfirm, Tooltip } from 'antd';
import { useContext, useState, useRef } from 'react';
import { MultipleAsyncContext } from '../../CreateModal/MultipleAsyncContext';
import EditTemplate from './EditTemplate';
import ShowTemplate from './ShowTemplate';
import classNames from 'classnames';
import styles from './index.less';

const ManageTemplate: React.FC<{
  manageTemplateModalOpen: boolean;
  setManageTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reload: () => Promise<void>;
}> = ({ manageTemplateModalOpen, reload, setManageTemplateModalOpen }) => {
  const { projectId, projectMap } = useContext(MultipleAsyncContext);
  const tableRef = useRef(null);
  const [editTemplateDrawerOpen, setEditTemplateDrawerOpen] = useState<boolean>(false);
  const [editTemplateId, setEditTemplateId] = useState<number>();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<
    | {
        current?: number;
        total: number;
      }
    | false
  >();
  const loadTemplateList = async (args: ITableLoadOptions) => {
    const { pagination, pageSize } = args ?? {};
    const { current = 1 } = pagination ?? {};
    const response = await getTemplateList({
      projectId,
      currentOrganizationId: login.organizationId?.toString(),
      size: pageSize,
      page: current,
    });
    if (response?.contents?.length) {
      setTemplateList(response?.contents);
      setPagination({
        current: response?.page?.number,
        total: response?.page?.totalElements,
      });
    } else {
      setTemplateList([]);
      setPagination(false);
    }
  };
  const handleEditTemplate = (open: boolean, templateId?: number) => {
    setEditTemplateId(templateId);
    setEditTemplateDrawerOpen(open);
  };
  const handleDeleteTemplate = async (id: number) => {
    const response = await deleteTemplate(id, login?.organizationId?.toString());
    if (response) {
      message.success(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.components.Template.A33F15D9',
          defaultMessage: '模板删除成功',
        }),
      );
      await tableRef?.current?.reload({ page: 1 });
    } else {
      message.error(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.components.Template.F5BFD8B1',
          defaultMessage: '模版删除失败',
        }),
      );
    }
  };
  return (
    <>
      <Drawer
        width={520}
        title={formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.components.Template.1A7C5740',
          defaultMessage: '模版管理',
        })}
        open={manageTemplateModalOpen}
        onClose={() => {
          setManageTemplateModalOpen(false);
        }}
        closable
        destroyOnClose
        footer={null}
      >
        <Descriptions column={2}>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.components.Template.8C08DC21',
              defaultMessage: '所属项目',
            })}
          >
            {projectMap?.[projectId]}
          </Descriptions.Item>
        </Descriptions>
        <div
          style={{
            height: '80%',
          }}
        >
          <CommonTable
            key="MultipleAsyncTemplatesTable"
            ref={tableRef}
            titleContent={null}
            showToolbar={false}
            onLoad={loadTemplateList}
            onChange={loadTemplateList}
            operationContent={{ options: [] }}
            tableProps={{
              rowKey: 'id',
              columns: [
                {
                  key: 'name',
                  dataIndex: 'name',
                  title: formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.components.Template.67470F74',
                    defaultMessage: '模板',
                  }),
                  width: 368,
                  render: (name, template: Template) => {
                    const databaseIdsMap = {};
                    template?.databaseSequenceList.forEach((dbs) => {
                      dbs?.forEach((item) => {
                        databaseIdsMap[item?.id] = item;
                      }, {});
                    });
                    const orderedDatabaseIds = template?.databaseSequenceList?.map((dbs) => {
                      return dbs.map((db) => db.id);
                    });
                    return template?.enabled ? (
                      <Popover
                        placement="left"
                        overlayInnerStyle={{
                          padding: '16px',
                        }}
                        content={
                          <ShowTemplate
                            orderedDatabaseIds={orderedDatabaseIds}
                            databaseIdsMap={databaseIdsMap}
                          />
                        }
                      >
                        <div
                          style={{
                            cursor: 'pointer',
                          }}
                        >
                          {name}
                        </div>
                      </Popover>
                    ) : (
                      <Tooltip
                        title={formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.components.Template.81FA47D5',
                          defaultMessage: '模版已失效',
                        })}
                        placement="left"
                      >
                        <div className={styles.disabled}>{name}</div>
                      </Tooltip>
                    );
                  },
                },
                {
                  key: 'action',
                  title: formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.components.Template.0D800390',
                    defaultMessage: '操作',
                  }),
                  render: (_, template: Template) => {
                    return (
                      <Space>
                        <div>
                          <Tooltip
                            title={
                              !template?.enabled
                                ? formatMessage({
                                    id: 'src.component.Task.MutipleAsyncTask.components.Template.72C9630F',
                                    defaultMessage: '模版已失效',
                                  })
                                : null
                            }
                          >
                            <a
                              style={{ display: 'block' }}
                              className={classNames({
                                [styles.disabled]: !template?.enabled,
                              })}
                              onClick={() => {
                                if (!template?.enabled) {
                                  return;
                                }
                                handleEditTemplate(true, template?.id);
                              }}
                            >
                              {formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.components.Template.E0648BE6',
                                defaultMessage: '编辑',
                              })}
                            </a>
                          </Tooltip>
                        </div>
                        <Popconfirm
                          onCancel={() => {}}
                          onConfirm={() => handleDeleteTemplate(template?.id)}
                          okText={formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.components.Template.869B1F0B',
                            defaultMessage: '确认',
                          })}
                          disabled={!template?.enabled}
                          cancelText={formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.components.Template.D8ACCBE8',
                            defaultMessage: '取消',
                          })}
                          title={formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.components.Template.7ADC635A',
                            defaultMessage: '删除模版不影响已发起的工单，是否确定删除？',
                          })}
                        >
                          <div>
                            <a>
                              {formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.components.Template.9BF60D4F',
                                defaultMessage: '删除',
                              })}
                            </a>
                          </div>
                        </Popconfirm>
                      </Space>
                    );
                  },
                },
              ],

              dataSource: templateList,
              pagination: pagination,
              scroll: {
                x: 376,
              },
            }}
          />
        </div>
        <EditTemplate
          projectId={projectId}
          templateId={editTemplateId}
          open={editTemplateDrawerOpen}
          setOpen={setEditTemplateDrawerOpen}
          onSuccess={async () => {
            setEditTemplateDrawerOpen(false);
            await tableRef?.current?.reload({ page: 1 });
          }}
        />
      </Drawer>
    </>
  );
};
export default ManageTemplate;
