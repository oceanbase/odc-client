import { getEnvironment, listEnvironments, updateEnvironment } from '@/common/network/env';
import { listRulesets } from '@/common/network/ruleset';
import { IEnvironment, TagType } from '@/d.ts/environment';
import { Descriptions, Drawer, Form, message, Modal, Select, Space, Table, Tabs } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import RiskLevel from '../components/RiskLevel';
import SecureTable from '../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode } from '../components/SecureTable/interface';
import styles from './index.less';

const EnvTag: React.FC<TagType> = ({ tabStyle, tabContent }) => (
  <div className={tabStyle}>{tabContent}</div>
);
const envTagMap = {
  开发: <EnvTag tabContent={'开发'} tabStyle={classNames(styles.tab, styles.dev)} />,
  测试: <EnvTag tabContent={'测试'} tabStyle={classNames(styles.tab, styles.test)} />,
  生产: <EnvTag tabContent={'生产'} tabStyle={classNames(styles.tab, styles.prod)} />,
};

const env = () => {
  const tableRef = useRef<any>(null);
  const [formRef] = useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<IEnvironment>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [data, setData] = useState<IEnvironment[]>(null);
  const [options, setOptions] = useState<
    {
      label: string;
      value: string | number;
    }[]
  >([]);
  const onClose = () => {
    setVisible(false);
  };

  const onLoad = async () => {
    const data = await listEnvironments();
    setData(data);
  };

  const handleOpen = (data: IEnvironment) => {
    setSelectedData(data);
    setVisible(true);
  };
  const initData = async () => {
    const data = await listEnvironments();
    setData(data);
  };
  const handleUpdateEnvironment = async () => {
    setModalVisible(false);
    console.log(formRef.getFieldsValue());
    data[index] = selectedData;
    const flag = await updateEnvironment(selectedData.id, selectedData);
    if (flag) {
      message.success('提交成功');
    } else {
      message.error('提交失败');
    }
    // 刷新列表
    tableRef.current.reload();
  };
  const handleViewSqlDevSpecification = async (id: number) => {
    const res = await getEnvironment(id);
    setModalVisible(true);
  };
  const handleOpenEditModal = async (record: IEnvironment) => {
    setSelectedData(record);
    const opts = await listRulesets();
    const resolveOpt = opts.map((opt) => ({
      label: opt.name,
      value: opt.id,
    }));
    setOptions(resolveOpt);
    setModalVisible(true);
  };
  const handleCloseModal = () => {
    setModalVisible(false);
    formRef.resetFields();
  };
  const getSqlDevSpecifications = async () => {};
  useEffect(() => {
    initData();
  }, []);
  const columns: ColumnsType<IEnvironment> = [
    {
      title: '环境名称',
      width: 200,
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => <>{text}</>,
    },
    {
      title: '描述',
      width: 400,
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => {
        return <div>{text ? text : '默认描述'}</div>;
      },
    },
    {
      title: '标签样式',
      width: 120,
      dataIndex: 'tag',
      key: 'tag',
      render: (_, { name = '开发' }) => envTagMap[name],
    },
    {
      title: 'SQL 开发规范',
      width: 200,
      dataIndex: 'sqlDevSpecification',
      key: 'sqlDevSpecification',
      render: (_, record, index) => {
        return <a onClick={() => handleOpen(record)}>{record.rulesetName}</a>;
      },
    },
    {
      title: '操作',
      width: 120,
      key: 'action',
      render: (_, record, index) => (
        <>
          <Space>
            <a onClick={() => handleOpenEditModal(record)}>编辑</a>
          </Space>
        </>
      ),
    },
  ];
  return (
    <>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        titleContent={null}
        showToolbar={false}
        showPagination={false}
        filterContent={{}}
        operationContent={{
          options: [],
        }}
        onLoad={onLoad}
        tableProps={{
          columns,
          dataSource: data,
          pagination: false,
        }}
      />
      <SetApprovalDrawer visible={visible} onClose={onClose} {...selectedData} />
      <Modal
        visible={modalVisible}
        onCancel={handleCloseModal}
        title={'编辑环境'}
        width={480}
        maskClosable={false}
        centered={true}
        onOk={handleUpdateEnvironment}
      >
        <Form layout="vertical" form={formRef} initialValues={{ selectedData }}>
          <Form.Item
            label={'SQL 开发规范'}
            name={'rulesetName'}
            rules={[
              {
                required: true,
                message: 'Please input your username!',
              },
            ]}
          >
            <Select defaultValue={selectedData?.rulesetName || 'dev'} options={options} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
interface ApprovalDrawerProps {
  visible: boolean;
  onClose: () => void;
  drawerTitle?: string;
  name: string;
  tag: string;
  description: string;
}
interface SubDataType {
  taskType: string;
  specificationName: string;
  config: string;
  riskLevel: number;
}
const SetApprovalDrawer: React.FC<Partial<ApprovalDrawerProps>> = ({
  visible,
  onClose,
  name,
  tag,
  description,
}) => {
  const rules: React.ReactNode[] = [];
  const onSubmit = () => {
    onClose();
  };
  const cancel = () => {
    onClose();
  };
  const columns: ColumnsType<SubDataType> = [
    {
      title: '任务类型',
      width: 240,
      dataIndex: 'taskType',
      key: 'taskType',
    },
    {
      title: '规则名称',
      width: 280,
      dataIndex: 'specificationName',
      key: 'specificationName',
    },
    {
      title: '配置值',
      width: 280,
      dataIndex: 'config',
      key: 'config',
    },
    {
      title: '风险等级',
      width: 120,
      key: 'riskLevel',
      dataIndex: 'riskLevel',
      render: (_, record, index) => <RiskLevel level={record.riskLevel} />,
    },
  ];
  const data: SubDataType[] = [
    {
      taskType: '数据库变更',
      specificationName: '执行 SQL 类型',
      config: 'Select',
      riskLevel: 0,
    },
  ];
  const dataCheck: SubDataType[] = [
    {
      taskType: '数据库变更-check',
      specificationName: '执行 SQL 类型',
      config: 'Select',
      riskLevel: 0,
    },
  ];
  const dataWindow: SubDataType[] = [
    {
      taskType: '数据库变更-window',
      specificationName: '执行 SQL 类型',
      config: 'Select',
      riskLevel: 0,
    },
  ];
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      placement="right"
      title="SQL 开发规范详情"
      footerStyle={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      className={classNames(styles.envDrawer)}
      width={960}
    >
      <>
        <Descriptions column={1}>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'风险识别规则名称'}>
            {name}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'关联环境'}>
            {envTagMap[name]}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'描述'}>
            {description}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'规则设置'}>
            {' '}
          </Descriptions.Item>
        </Descriptions>
      </>
      {name === 'sqlDevSpecification' ? (
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          className={classNames(styles.tableSpin, styles.smallTable, {
            // [styles.scrollAble]: !!scrollHeight,
          })}
        />
      ) : (
        <Tabs>
          <Tabs.TabPane tab="SQL 检查规范" key={'sql-check'}>
            <Table
              key={'sql-check-table'}
              columns={columns}
              dataSource={dataCheck}
              pagination={false}
              className={classNames(styles.tableSpin, styles.smallTable, {
                // [styles.scrollAble]: !!scrollHeight,
              })}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="SQL 窗口规范" key={'sql-window'}>
            <Table
              key={'sql-window-table'}
              columns={columns}
              dataSource={dataWindow}
              pagination={false}
              className={classNames(styles.tableSpin, styles.smallTable, {
                // [styles.scrollAble]: !!scrollHeight,
              })}
            />
          </Tabs.TabPane>
        </Tabs>
      )}
    </Drawer>
  );
};

export default env;
