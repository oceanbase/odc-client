import { listEnvironments } from '@/common/network/env';
import { deleteRiskDetectRule } from '@/common/network/riskDetectRule';
import { Acess, canAcess, createPermission } from '@/component/Acess';
import { actionTypes, IManagerResourceType, TaskType } from '@/d.ts';
import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { formatMessage } from '@/util/intl';
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
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
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
      message.success(
        formatMessage({
          id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.DeletedSuccessfully',
        }), //删除成功
      );
      reload();
    } else {
      message.error(
        formatMessage({ id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.FailedToDelete' }), //删除失败
      );
    }
  };

  const columns: ColumnsType<IRiskDetectRule> = [
    {
      title: formatMessage({ id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.RuleName' }), //规则名称
      dataIndex: 'name',
      key: 'name',
      // width: 573,
    },
    {
      title: formatMessage({ id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.Founder' }), //创建人
      dataIndex: 'creator',
      // width: 120,
      key: 'creator',
      render: (_, record) =>
        record?.creator?.name ||
        formatMessage({ id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.DefaultCreator' }), //默认创建人
    },
    {
      title: formatMessage({
        id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.CreationTime',
      }), //创建时间
      dataIndex: 'createTime',
      key: 'createTime',
      // width: 200,
      render: (text) => getLocalFormatDateTime(text),
    },
    {
      title: formatMessage({ id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.Operation' }), //操作
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
              {
                formatMessage({
                  id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.View',
                }) /*查看*/
              }
            </a>
            <Acess {...createPermission(IManagerResourceType.risk_detect, actionTypes.update)}>
              <a
                onClick={async () => {
                  handleDrawerEdit(record);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.Edit',
                  }) /*编辑*/
                }
              </a>
            </Acess>
            <Acess {...createPermission(IManagerResourceType.risk_detect, actionTypes.delete)}>
              <Popconfirm
                title={
                  formatMessage({
                    id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.AreYouSureYouWant',
                  }) //是否确定删除？
                }
                okText={
                  formatMessage({ id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.Ok' }) //确定
                }
                cancelText={
                  formatMessage({
                    id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.Cancel',
                  }) //取消
                }
                onConfirm={() => {
                  handleDelete(record.id);
                }}
              >
                <a>
                  {
                    formatMessage({
                      id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.Delete',
                    }) /*删除*/
                  }
                </a>
              </Popconfirm>
            </Acess>
          </Space>
        );
      },
    },
  ];

  const operationOptions = [];
  const canCreate = canAcess(
    createPermission(IManagerResourceType.risk_detect, actionTypes.create),
  )?.accessible;
  canCreate &&
    operationOptions.push({
      type: IOperationOptionType.button,
      content: formatMessage({
        id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.CreateARiskIdentificationRule',
      }), //新建风险识别规则 //新建流程
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
          searchPlaceholder: formatMessage({
            id: 'odc.RiskDetectRules.components.InnerRiskDetectRules.EnterARuleNameTo',
          }), //请输入规则名称搜索
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
      label: TaskType.IMPORT,
      value: TaskType.IMPORT,
    },
    {
      label: TaskType.EXPORT,
      value: TaskType.EXPORT,
    },
    {
      label: TaskType.DATAMOCK,
      value: TaskType.DATAMOCK,
    },
    {
      label: TaskType.ASYNC,
      value: TaskType.ASYNC,
    },
    {
      label: TaskType.PARTITION_PLAN,
      value: TaskType.PARTITION_PLAN,
    },
    {
      label: TaskType.SQL_PLAN,
      value: TaskType.SQL_PLAN,
    },
    {
      label: TaskType.ALTER_SCHEDULE,
      value: TaskType.ALTER_SCHEDULE,
    },
    {
      label: TaskType.SHADOW,
      value: TaskType.SHADOW,
    },
    {
      label: TaskType.DATA_SAVE,
      value: TaskType.DATA_SAVE,
    },
  ];

  return newTaskTypeOptions;
};
const getSqlCheckResultOptions = () => {
  const sqlCheckResultOptions = [
    {
      label: RiskLevelTextMap[RiskLevelEnum.DEFAULT],
      value: RiskLevelEnum.DEFAULT,
    },
    {
      label: RiskLevelTextMap[RiskLevelEnum.SUGGEST],
      value: RiskLevelEnum.SUGGEST,
    },
    {
      label: RiskLevelTextMap[RiskLevelEnum.MUST],
      value: RiskLevelEnum.MUST,
    },
  ];

  return sqlCheckResultOptions;
};
