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
      message.success('模板删除成功');
      await tableRef?.current?.reload({ page: 1 });
    } else {
      message.error('模版删除失败');
    }
  };
  return (
    <>
      <Drawer
        width={520}
        title="模版管理"
        open={manageTemplateModalOpen}
        onClose={() => {
          setManageTemplateModalOpen(false);
        }}
        closable
        destroyOnClose
        footer={null}
      >
        <Descriptions column={2}>
          <Descriptions.Item label="所属项目">{projectMap?.[projectId]}</Descriptions.Item>
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
                  title: '模板',
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
                      <Tooltip title="模版已失效" placement="left">
                        <div className={styles.disabled}>{name}</div>
                      </Tooltip>
                    );
                  },
                },
                {
                  key: 'action',
                  title: '操作',
                  render: (_, template: Template) => {
                    return (
                      <Space>
                        <div>
                          <Tooltip title={!template?.enabled ? '模版已失效' : null}>
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
                              编辑
                            </a>
                          </Tooltip>
                        </div>
                        <Popconfirm
                          onCancel={() => {}}
                          onConfirm={() => handleDeleteTemplate(template?.id)}
                          okText="确认"
                          disabled={!template?.enabled}
                          cancelText="取消"
                          title="删除模版不影响已发起的工单，是否确定删除？"
                        >
                          <div>
                            <a>删除</a>
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
