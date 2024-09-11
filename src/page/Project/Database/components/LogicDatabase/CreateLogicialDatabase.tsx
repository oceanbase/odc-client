import HelpDoc from '@/component/helpDoc';
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  SelectProps,
  Space,
  Tooltip,
  Tree,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { useForm, useWatch } from 'antd/lib/form/Form';
import { useRequest } from 'ahooks';
import { listDatabases } from '@/common/network/database';
import login from '@/store/login';
import { IDatabase } from '@/d.ts/database';
import { EnvColorMap } from '@/constant';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import Icon from '@ant-design/icons';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { DefaultOptionType } from 'antd/lib/select';
import { createLogicalDatabase } from '@/common/network/logicalDatabase';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import DatabaseSelecter from '@/component/Task/component/DatabaseSelecter';
import { SPACE_REGEX } from '@/constant';

const ProjectDatabaseSelector: React.FC<{
  width?: number | string;
  databaseOptions: SelectProps['options'];
}> = ({ width = 320, databaseOptions }) => {
  const defaultPlaceholder = '请选择';
  const [projectName, setProjectName] = useState<string>();
  const [datasourceName, setDatasourceName] = useState<string>();

  return (
    <Form.Item
      label={
        <HelpDoc
          isTip
          leftText
          title={
            '基准库是逻辑库中包含的一个数据库，用于指定环境和类型；系统可根据基准库的名称、环境、类型等信息，默认选中逻辑库可能包含的数据库。'
          }
        >
          基准库
        </HelpDoc>
      }
    >
      <Form.Item name="baseDatabase" noStyle>
        <Select
          placeholder={defaultPlaceholder}
          optionLabelProp="placeholder"
          onChange={(value, option: DefaultOptionType) => {
            setProjectName(option?.projectName);
            setDatasourceName(option?.datasourceName);
          }}
          showSearch
          filterOption={(value, option) => {
            return option?.name?.toLowerCase()?.indexOf(value?.toLowerCase()) >= 0;
          }}
          style={{
            width,
          }}
          options={databaseOptions}
        />
      </Form.Item>
      {(projectName || datasourceName) && (
        <div style={{ marginTop: '4px' }}>
          <Space split={<Divider type="vertical" />} style={{ color: 'var(--text-color-hint)' }}>
            <Typography.Text type="secondary">项目: {projectName ?? '-'}</Typography.Text>

            <Typography.Text type="secondary">数据源: {datasourceName ?? '-'}</Typography.Text>
          </Space>
        </div>
      )}
    </Form.Item>
  );
};

const CreateLogicialDatabase: React.FC<{
  projectId: number;
  openLogicialDatabase: boolean;
  reload: (name?: string) => void;
  setOpenLogicialDatabase: (open: boolean) => void;
  openLogicDatabaseManageModal: (id: number) => void;
}> = ({
  projectId,
  openLogicialDatabase,
  reload,
  setOpenLogicialDatabase,
  openLogicDatabaseManageModal,
}) => {
  const [form] = useForm<{
    baseDatabase: number;
    alias: string;
    name: string;
    physicalDatabaseIds: number[];
  }>();
  const baseDatabase = useWatch('baseDatabase', form);
  const alias = useWatch('alias', form);
  const name = useWatch('name', {
    form,
    preserve: true,
  });
  const physicalDatabaseIds = useWatch('physicalDatabaseIds', form);
  const [allDatabaseList, setAllDatabaseList] = useState<IDatabase[]>([]);
  const [databaseOptions, setDatabaseOptions] = useState<any[]>([]);
  const [databaseList, setDatabaseList] = useState<IDatabase[]>([]);
  const [checkedDatabaseList, setCheckedDatabaseList] = useState<number[]>([]);

  useEffect(() => {
    const name = databaseOptions?.find((i) => i.value === baseDatabase)?.name;
    form.setFields([
      {
        name: 'alias',
        value: name,
        errors: [],
      },
      {
        name: 'name',
        value: `logical_${name}`,
        errors: [],
      },
    ]);
  }, [baseDatabase]);
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
    if (databaseList?.contents?.length) {
      setAllDatabaseList(databaseList?.contents);
      setDatabaseOptions(
        databaseList?.contents?.reduce((pre, cur) => {
          if (cur.type === 'LOGICAL') {
            return pre;
          }
          const icon = getDataSourceStyleByConnectType(cur?.dataSource?.type);
          pre.push({
            label: (
              <Tooltip placement="left">
                <div
                  style={{
                    display: 'flex',
                    position: 'relative',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DataBaseStatusIcon item={cur} />
                    <div style={{ maxWidth: '210px', marginLeft: 4 }}>{cur.name}</div>
                    <div
                      style={{
                        color: 'rgba(0,0,0,0.25)',
                        marginLeft: '4px',
                        maxWidth: '94px',
                        flexShrink: 0,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        wordBreak: 'break-all',
                        whiteSpace: 'nowrap',
                        width: '94px',
                      }}
                    >
                      {cur?.dataSource?.name}
                    </div>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      width: '6px',
                      height: '6px',
                      borderRadius: '1px',
                      background: EnvColorMap[cur?.environment?.style?.toUpperCase()]?.tipColor,
                      position: 'absolute',
                      right: '0px',
                    }}
                  />
                </div>
              </Tooltip>
            ),
            value: cur.id,
            placeholder: (
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  alignItems: 'center',
                }}
              >
                <RiskLevelLabel content={cur?.environment?.name} color={cur?.environment?.style} />
                <div style={{ display: 'flex' }}>
                  <Icon
                    component={icon?.icon?.component}
                    style={{
                      color: icon?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />
                  <div style={{ maxWidth: '210px' }}>{cur.name}</div>
                </div>
              </div>
            ),
            projectName: cur?.project?.name,
            datasourceName: cur?.dataSource?.name,
            name: cur?.name,
          });
          return pre;
        }, []),
      );
    }
  };
  const handleCancel = async () => {
    setOpenLogicialDatabase(false);
    await form.resetFields();
    setAllDatabaseList([]);
    setDatabaseOptions([]);
    setDatabaseList([]);
    setCheckedDatabaseList([]);
  };
  const handleSubmit = async () => {
    const values = await form.validateFields().catch();
    const res = await createLogicalDatabase({
      alias: values?.alias,
      physicalDatabaseIds: values?.physicalDatabaseIds,
      projectId,
      name,
    });
    if (res?.id) {
      reload?.();
      message.success(
        <Space>
          <div>逻辑库配置成功，后台正在提取逻辑表，可前往</div>
          <div>
            <Typography.Link onClick={() => openLogicDatabaseManageModal(res?.id)}>
              逻辑表管理
            </Typography.Link>
          </div>
        </Space>,
      );
      setOpenLogicialDatabase(false);
      form.resetFields();
      return;
    }
    message.error('逻辑库配置失败');
  };
  useEffect(() => {
    // getLogicalDatabaseNickname(baseDatabase);
    if (projectId && openLogicialDatabase) {
      loadDatabaseList(projectId);
    } else {
      form.resetFields();
    }
  }, [openLogicialDatabase]);
  useEffect(() => {
    if (baseDatabase) {
      const selectedOne = allDatabaseList.find((item) => item.id === baseDatabase);
      const filterDatabseList = allDatabaseList?.filter(
        (item) =>
          item.project.id === projectId &&
          item.dataSource?.id === selectedOne.dataSource?.id &&
          item.environment?.id === selectedOne.environment?.id,
      );
      setDatabaseList(filterDatabseList);
      setCheckedDatabaseList([baseDatabase]);
      form.setFieldValue('physicalDatabaseIds', [baseDatabase]);
    }
  }, [baseDatabase]);

  const databaseFilter = (list: IDatabase[]) => {
    if (!baseDatabase) return list;
    // 仅支持配置同一项目内、相同数据源类型、相同环境的数据库
    const datasourceType = list?.find((i) => i.id === baseDatabase)?.dataSource?.dialectType;
    const environment = list?.find((i) => i.id === baseDatabase)?.environment?.name;
    return list?.filter(
      (i) => i?.dataSource?.dialectType === datasourceType && i?.environment?.name === environment,
    );
  };

  return (
    <div>
      <Drawer
        title={'配置逻辑库'}
        open={openLogicialDatabase}
        maskClosable
        onClose={handleCancel}
        width={720}
        destroyOnClose
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
            }}
          >
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </div>
        }
      >
        <Alert
          showIcon
          type="info"
          message="逻辑库仅支持配置同一项目内、相同数据源类型、相同环境的数据库，配置成功后不可修改。"
        />
        <Form form={form} layout="vertical">
          <ProjectDatabaseSelector databaseOptions={databaseOptions} width={'400px'} />
          <Form.Item
            label={
              <HelpDoc isTip leftText title={'别名可用于区分同名的逻辑库，默认与实际逻辑库名一致'}>
                逻辑库别名
              </HelpDoc>
            }
          >
            <Form.Item
              noStyle
              name={'alias'}
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
                {
                  validator: async (ruler, value) => {
                    const name = value?.trim();
                    if (!name) {
                      return;
                    }
                  },
                },
                {
                  pattern: SPACE_REGEX,
                  message: '不能包含空格',
                },
              ]}
            >
              <Input
                style={{ width: '400px' }}
                placeholder={'请输入'}
                onChange={async (e) => {
                  await form.setFields([
                    {
                      name: 'name',
                      value: `${e.target.value}`,
                      errors: [],
                    },
                  ]);
                }}
                showCount
                maxLength={64}
              />
            </Form.Item>
          </Form.Item>
          <Form.Item label="数据库" name="physicalDatabaseIds" shouldUpdate>
            <DatabaseSelecter
              projectId={baseDatabase ? projectId : null}
              databaseFilter={databaseFilter}
              baseDatabase={baseDatabase}
              showEnv
              infoText="仅支持选择与基准库相同数据源类型和环境的数据库"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default CreateLogicialDatabase;
