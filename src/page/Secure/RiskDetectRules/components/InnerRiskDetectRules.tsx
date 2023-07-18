import { listEnvironments } from '@/common/network/env';
import { deleteRiskDetectRule } from '@/common/network/riskDetectRule';
import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { getLocalFormatDateTime } from '@/util/utils';
import { message, Popconfirm, Space } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useRef, useState } from 'react';
import SecureTable from '../../components/SecureTable';
import {
  CommonTableBodyMode,
  CommonTableMode,
  IOperationOptionType,
} from '../../components/SecureTable/interface';
import { InnerRiskDetectRulesProps, SelectItemProps } from '../interface';
import FormRiskDetectDrawer from './FormRiskDetectDrawer';
import styles from './index.less';
import ViewRiskDetectDrawer from './ViewRiskDetectDrawer';

const InnerRiskDetectRules: React.FC<InnerRiskDetectRulesProps> = ({
  userStore,
  loading,
  exSearch,
  exReload,
  riskLevel,
  riskDetectRules = [],
  getListRiskDetectRules,
}) => {
  const { organizationId } = userStore;
  const tableRef = useRef(null);
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<IRiskDetectRule>();
  const [environmentIdMap, setEnvironmentIdMap] = useState<{
    [key in string | number]: string;
  }>({});
  const [taskTypeIdMap, setTaskTypeIdMap] = useState<{
    [key in string | number]: string;
  }>({});
  const [sqlCheckResultIdMap, setSqlCheckResultIdMap] = useState<{
    [key in string | number]: string;
  }>({});
  const [environmentOptions, setEnvironmentOptions] = useState<SelectItemProps[]>([]);
  const [taskTypeOptions, setTaskTypeOptions] = useState<SelectItemProps[]>([]);
  const [sqlCheckResultOptions, setSqlCheckResultOptions] = useState<SelectItemProps[]>([]);

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const init = async () => {
    const envOptions = await getEnvironmentOptions();
    const envIdMap = {};
    envOptions?.forEach(({ value, label }) => (envIdMap[value] = label));
    setEnvironmentIdMap(envIdMap);
    setEnvironmentOptions(envOptions);

    const taskTypeOptions = await getTaskTypeOptions();
    const taskTypeIdMap = {};
    taskTypeOptions?.forEach(({ label, value }) => (taskTypeIdMap[value] = label));
    setTaskTypeIdMap(taskTypeIdMap);
    setTaskTypeOptions(taskTypeOptions);

    const sqlCheckResultOptions = await getSqlCheckResultOptions();
    const sqlChekcResultMap = {};
    sqlCheckResultOptions?.forEach(({ label, value }) => (sqlChekcResultMap[value] = label));
    setSqlCheckResultIdMap(sqlChekcResultMap);
    setSqlCheckResultOptions(sqlCheckResultOptions);
  };
  const handleDrawerView = (riskDetectRule: IRiskDetectRule) => {
    setIsEdit(false);
    setSelectedRecord({ ...riskDetectRule });
    setViewDrawerVisible(true);
  };

  const handleDrawerEdit = (riskDetectRule: IRiskDetectRule) => {
    setIsEdit(true);
    setSelectedRecord({ ...riskDetectRule });
    setFormModalVisible(true);
  };

  const handleDrawerCreate = () => {
    setIsEdit(false);
    setFormModalVisible(true);
  };
  const reload = () => {
    getListRiskDetectRules(riskLevel);
  };
  const handleDelete = async (id: number) => {
    const result: boolean = await deleteRiskDetectRule(id);
    if (result) {
      message.success('删除成功');
      reload();
    } else {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<IRiskDetectRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      // width: 573,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      // width: 120,
      key: 'creator',
      render: (_, record) => record?.creator?.name || '默认创建人',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      // width: 200,
      render: (text) => getLocalFormatDateTime(text),
    },
    {
      title: '操作',
      key: 'action',
      // width: 200,
      render: (value, record) => {
        return (
          <Space>
            <a
              onClick={() => {
                handleDrawerView(record);
              }}
            >
              查看
            </a>
            <a
              onClick={async () => {
                handleDrawerEdit(record);
              }}
            >
              编辑
            </a>
            <Popconfirm
              title={'是否确定删除？'}
              okText={'确定'}
              cancelText={'取消'}
              onConfirm={() => {
                handleDelete(record.id);
              }}
            >
              <a>删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const operationOptions = [];
  operationOptions.push({
    type: IOperationOptionType.button,
    content: '新建风险识别规则',
    //新建流程
    isPrimary: true,
    onClick: handleDrawerCreate,
  });
  operationOptions.push({
    type: IOperationOptionType.icon,
  });
  useEffect(() => {
    init();
  }, []);
  return (
    <div className={styles.innerRiskDetectRules}>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        titleContent={null}
        showPagination={false}
        filterContent={{
          searchPlaceholder: '请输入规则名称搜索',
        }}
        operationContent={{
          options: operationOptions,
        }}
        onLoad={null}
        onChange={null}
        exSearch={exSearch}
        exReload={exReload}
        tableProps={{
          columns: columns,
          loading: loading,
          dataSource: riskDetectRules,
          rowKey: 'id',
          pagination: false,
          scroll: {
            // x: 1084,
          },
        }}
      />
      <FormRiskDetectDrawer
        {...{
          isEdit,
          riskLevel,
          selectedRecord,
          formModalVisible,
          setFormModalVisible,
          environmentIdMap,
          environmentOptions,
          taskTypeOptions,
          sqlCheckResultOptions,
          reload,
        }}
      />
      <ViewRiskDetectDrawer
        {...{
          organizationId,
          viewDrawerVisible,
          setViewDrawerVisible,
          environmentIdMap,
          taskTypeIdMap,
          sqlCheckResultIdMap,
          riskLevel,
          selectedRecord,
        }}
      />
    </div>
  );
};
export default InnerRiskDetectRules;

const getEnvironmentOptions = async () => {
  const rawData = (await listEnvironments()) || [];
  const newEnvOptions = rawData?.map((rd) => {
    return {
      label: rd.name,
      value: '' + rd.id,
    };
  });
  return newEnvOptions;
};
const getTaskTypeOptions = () => {
  const newTaskTypeOptions = [
    {
      label: 'IMPORT',
      value: 'import',
    },
    {
      label: 'EXPORT',
      value: 'export',
    },
    {
      label: 'MOCKDATA',
      value: 'mockdata',
    },
    {
      label: 'ASYNC',
      value: 'async',
    },
    {
      label: 'PARTITION_PLAN',
      value: 'partition_plan',
    },
    {
      label: 'SQL_PLAN',
      value: 'sql_plan',
    },
    {
      label: 'ALTER_SCHEDULE',
      value: 'alter_schedule',
    },
    {
      label: 'SHADOWTABLE_SYNC',
      value: 'shadowtable_sync',
    },
    {
      label: 'DATA_SAVE',
      value: 'data_save',
    },
  ];
  return newTaskTypeOptions;
};
const getSqlCheckResultOptions = () => {
  const sqlCheckResultOptions = [
    {
      label: '无需改进',
      value: '' + 1,
    },
    {
      label: '建议改进',
      value: '' + 2,
    },
    {
      label: '必须改进',
      value: '' + 3,
    },
  ];
  return sqlCheckResultOptions;
};
