import { canAcess } from '@/component/Acess';
import Action from '@/component/Action';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { InfoCircleOutlined } from '@ant-design/icons';
import { formatMessage } from '@umijs/max';
import { Button, Descriptions, Drawer, Form, Input, Select, Table, Tabs } from 'antd';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import SecureTable from '../components/SecureTable';
import {
  CommonTableBodyMode,
  CommonTableMode,
  IOperationOptionType,
} from '../components/SecureTable/interface';
import styles from './index.less';
const { Option } = Select;
interface DataType {
  key: React.Key;
  id: number;
  specificationName: string;
  description: string;
  creator: string;
  createTime: string;
}
enum OperationType {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  COPY = 'COPY',
  DELETE = 'DELETE',
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

interface DrawerTriggerActionParams {
  action: OperationType;
  data?: any;
}
const data: DataType[] = [
  {
    key: '1',
    id: 1,
    specificationName: 'specificationName',
    description: 'description',
    creator: 'creator',
    createTime: 'createTime',
  },
  {
    key: '2',
    id: 2,
    specificationName: 'specificationName',
    description: 'description',
    creator: 'creator',
    createTime: 'createTime',
  },
  {
    key: '3',
    id: 3,
    specificationName: 'specificationName',
    description: 'description',
    creator: 'creator',
    createTime: 'createTime',
  },
];

enum RiskLevel {
  low = 'low',
  middle = 'middle',
  high = 'high',
}
interface SubTabletype {
  key: React.Key;
  specificationName: string;
  config: string;
  riskLevel: RiskLevel;
}
const subTableColumns: ColumnsType<SubTabletype> = [
  {
    key: 'specificationName',
    dataIndex: 'specificationName',
    title: '规范名称',
  },
  {
    key: 'config',
    dataIndex: 'config',
    title: '配置值',
    render: () => <Config />,
  },
  {
    key: 'riskLevel',
    dataIndex: 'riskLevel',
    title: '风险等级',
    render: (_, { riskLevel }) => <CRiskLevel riskLevel={riskLevel} />,
  },
];
const SQLDevelopmentSpecification: React.FC<any> = () => {
  const tableRef = useRef(null);
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState<boolean>(false);
  const subTableData: SubTabletype[] = [
    {
      key: '',
      specificationName: 'testSpecificationName',
      config: 'testConfig',
      riskLevel: RiskLevel['middle'],
    },
  ];

  const [dataSource, setDataSource] = useState<DataType[]>(data);

  const canAcessDelete = canAcess({
    resourceIdentifier: IManagerResourceType.flow_config,
    action: actionTypes.delete,
  }).accessible;

  const openDetailModal = (taskflow: DataType) => {
    // setDetailModalVisible(true);
    // setDetailId(taskflow.id);
    // setCurrentTaskFlow(taskflow);
    setViewDrawerVisible(true);
  };
  const handleTask = (id: number, key: OperationType, taskFlow?: DataType) => {
    switch (key) {
      case OperationType.COPY:
        openFormModal(id, true);
        break;
      case OperationType.DELETE:
        handleDelete(id);
        break;
      case OperationType.EDIT:
        openFormModal(id);
        break;
      case OperationType.VIEW:
        openDetailModal(taskFlow);
        break;
      case OperationType.ENABLE:
        handleStatusChange(id, true);
        break;
      case OperationType.DISABLE:
        handleStatusChange(id, false);
        break;
      default:
    }
  };
  const handleTableChange = () => {};
  const onLoad = async () => {
    setDataSource(data);
    await setTimeout(() => {});
  };
  const openFormModal = (editId: number = null, isCopy: boolean = false) => {
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    openFormModal();
  };

  const handleResourceGroupEnable = async (id: number, enabled: boolean) => {};

  const handleStatusChange = (id: number, enabled: boolean, callback = () => {}) => {};

  const handleDelete = (param: React.Key | React.Key[]) => {};
  const handleConfirmBatchDelete = async (ids: number[]) => {};
  // const handleTask = (id: number, key: OperationType, taskFlow?: ITaskFlowConfig) => {
  //   switch (key) {
  //     case OperationType.COPY:
  //       openFormModal(id, true);
  //       break;
  //     case OperationType.DELETE:
  //       handleDelete(id);
  //       break;
  //     case OperationType.EDIT:
  //       openFormModal(id);
  //       break;
  //     case OperationType.VIEW:
  //       openDetailModal(taskFlow);
  //       break;
  //     case OperationType.ENABLE:
  //       handleStatusChange(id, true);
  //       break;
  //     case OperationType.DISABLE:
  //       handleStatusChange(id, false);
  //       break;
  //     default:
  //   }
  // };

  const columns: ColumnsType<DataType> = [
    {
      title: '规范名称',
      dataIndex: 'specificationName',
      key: 'specificationName',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (value, record) => {
        return (
          <Action.Group size={4}>
            <Action.Link
              key={'view'}
              onClick={() => {
                handleTask(record.id, OperationType.VIEW, record);
                // drawerTriggerAction({ action: OperationType.VIEW });
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.TaskFlowPage.View',
                })

                /*查看*/
              }
            </Action.Link>

            <Action.Link
              key={'edit'}
              onClick={async () => {
                handleTask(record.id, OperationType.EDIT);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.TaskFlowPage.Edit',
                })

                /*编辑*/
              }
            </Action.Link>
            <Action.Link
              key={'copy'}
              // visible={!record.builtIn}
              onClick={async () => {
                handleTask(record.id, OperationType.COPY);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.TaskFlowPage.Copy',
                })

                /*复制*/
              }
            </Action.Link>
            <Action.Link
              key={'delete'}
              // visible={!record.builtIn}
              onClick={async () => {
                handleTask(record.id, OperationType.DELETE);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.TaskFlowPage.Delete',
                })

                /*删除*/
              }
            </Action.Link>
          </Action.Group>
        );
      },
    },
  ];
  const operationOptions = [];
  operationOptions.push({
    type: IOperationOptionType.button,
    content: '新建规范',
    //新建流程
    isPrimary: true,
    onClick: handleCreate,
  });
  operationOptions.push({
    type: IOperationOptionType.icon,
  });
  return (
    <>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        titleContent={null}
        // rowReserve={true}
        filterContent={{
          searchPlaceholder: formatMessage({
            id: 'odc.components.UserPage.EnterAUserOrAccount',
          }),
          /* 请输入用户/账号搜索 */
        }}
        operationContent={{
          options: operationOptions,
        }}
        onLoad={onLoad}
        onChange={handleTableChange}
        tableProps={{
          columns: columns,
          dataSource: dataSource,
          rowKey: 'id',
          pagination: false,

          scroll: {
            x: 1000,
          },
        }}
      />
      <SpecificationDrawer
        {...{
          subTableData,
          formModalVisible,
          setFormModalVisible,
        }}
      />
      <ViewSpecification
        {...{
          viewDrawerVisible,
          setViewDrawerVisible,
          specificationName: 'name',
          descriptions: 'descriptions',
          sqlCheckData: {},
          sqlWindowData: {},
        }}
      />
    </>
  );
};
interface ViewSpecificationDrawer {
  viewDrawerVisible: boolean;
  setViewDrawerVisible: (v: boolean) => void;
  specificationName: string;
  descriptions: string;
  sqlCheckData: any;
  sqlWindowData: any;
}
const ViewSpecification: React.FC<ViewSpecificationDrawer> = ({
  viewDrawerVisible,
  setViewDrawerVisible,
  specificationName,
  descriptions,
  sqlCheckData,
  sqlWindowData,
}) => {
  return (
    <Drawer
      visible={viewDrawerVisible}
      width={600}
      onClose={() => {
        setViewDrawerVisible(false);
      }}
    >
      <>
        <Descriptions column={1}>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'规范名称'}>
            {specificationName}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'描述'}>
            {descriptions}
          </Descriptions.Item>
          <Descriptions.Item
            contentStyle={{ whiteSpace: 'pre' }}
            label={'规则设置'}
          ></Descriptions.Item>
        </Descriptions>
      </>
    </Drawer>
  );
};
interface SpecificationDrawerProps {
  subTableData: SubTabletype[];
  formModalVisible: boolean;
  setFormModalVisible: (v: boolean) => void;
}
const SpecificationDrawer: React.FC<SpecificationDrawerProps> = ({
  subTableData,
  formModalVisible,
  setFormModalVisible,
}) => {
  const [dataSource, setDataSource] = useState<SubTabletype[]>(subTableData);
  const clear = () => {
    setDataSource([]);
  };
  return (
    <Drawer
      visible={formModalVisible}
      width={600}
      onClose={() => {
        setFormModalVisible(false);
        clear();
      }}
      className={styles.sqlDrawer}
    >
      <>
        <Form layout="vertical">
          <Form.Item label="规范名称" name="specificationName">
            <Input placeholder="请输入规范名称" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            tooltip={{ title: 'Tooltip with customize icon', icon: <InfoCircleOutlined /> }}
          >
            <Input.TextArea
              autoSize={{
                minRows: 2,
                maxRows: 2,
              }}
              placeholder="请输入规范"
            />
          </Form.Item>
          <Form.Item label="规则设置" name="specificationSetting">
            <Tabs>
              <Tabs.TabPane tab="SQL 检查规范" key={'sql-check'}>
                <Table
                  columns={subTableColumns}
                  dataSource={dataSource}
                  pagination={false}
                  className={classNames(styles.tableSpin, styles.smallTable, {
                    // [styles.scrollAble]: !!scrollHeight,
                  })}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="SQL 窗口规范" key={'sql-window'}>
                <Table
                  columns={subTableColumns}
                  dataSource={dataSource}
                  pagination={false}
                  className={classNames(styles.tableSpin, styles.smallTable, {
                    // [styles.scrollAble]: !!scrollHeight,
                  })}
                />
              </Tabs.TabPane>
            </Tabs>
          </Form.Item>
        </Form>
      </>
    </Drawer>
  );
};
interface RiskLevelProps {
  riskLevel: string;
  onChange?: () => void;
}
const CRiskLevel: React.FC<RiskLevelProps> = ({ riskLevel = '', onChange = () => {} }) => {
  return (
    <Select
      defaultValue={riskLevel}
      onChange={onChange}
      options={[
        {
          value: 'low',
          label: '低',
        },
        {
          value: 'middle',
          label: '中',
        },
        {
          value: 'high',
          label: '高',
        },
      ]}
    />
  );
};
interface ConfigProps {
  config: string;
  onChange: () => void;
}
const Config: React.FC<Partial<ConfigProps>> = ({
  config = 'defaultConfig',
  onChange = () => {},
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {isEditing ? (
        <>
          <Input defaultValue={config} />
          <Button onClick={() => setIsEditing(false)}>comfirm</Button>
        </>
      ) : (
        <>
          <div>{config}</div>
          <Button onClick={() => setIsEditing(true)}>edit</Button>
        </>
      )}
    </div>
  );
};
export default SQLDevelopmentSpecification;
