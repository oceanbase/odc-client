import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Row, Col, Tooltip, message } from 'antd';
import Icon from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { getConnectionDetail, getConnectionList } from '@/common/network/connection';
import { formatMessage } from '@/util/intl';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { DatabaseOwnerSelect } from '../DatabaseOwnerSelect';
import { updateDataBase } from '@/common/network/database';
import { ConnectType, IConnection } from '@/d.ts';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
interface AddObjectStorageProps {
  open: boolean;
  projectId: number;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => void;
}

const AddObjectStorage: React.FC<AddObjectStorageProps> = (props) => {
  const { open, setOpen, projectId, onSuccess } = props;
  const [form] = Form.useForm();
  const [fileSystemDataSourceList, setFileSystemDataSourceList] = useState<IConnection[]>([]);

  const { loading: dataSourceListLoading } = useRequest(getConnectionList, {
    onSuccess: (e) => {
      // 过滤出对象存储的数据源
      setFileSystemDataSourceList(
        e.contents.filter((item) => isConnectTypeBeFileSystemGroup(item.type)),
      );
    },
    defaultParams: [
      {
        size: 99999,
        page: 1,
        type: [ConnectType.OSS, ConnectType.COS, ConnectType.OBS, ConnectType.S3A],
      },
    ],
  });
  const { run, loading: saveDatabaseLoading } = useRequest(updateDataBase, {
    manual: true,
  });
  const {
    data: dataSource,
    loading: dataSourceLoading,
    run: fetchDataSource,
  } = useRequest(getConnectionDetail, {
    manual: true,
  });

  const handlesubmit = async () => {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const params = {
      ownerIds: formData?.ownerIds,
      databaseIds: [Number(form.getFieldValue('dataSourceId'))],
    };
    console.log(params);
    const isSuccess = await run(params.databaseIds, projectId, params.ownerIds);
    if (isSuccess) {
      message.success(
        formatMessage({
          id: 'odc.Database.AddDataBaseButton.AddedSuccessfully',
          defaultMessage: '添加成功',
        }), //添加成功
      );
      setOpen(false);
      onSuccess();
      form.resetFields();
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Modal
        title="添加对象存储"
        open={open}
        onOk={handlesubmit}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={'optional'}
          onValuesChange={(changedValues) => {
            if (changedValues.hasOwnProperty('dataSourceId')) {
              fetchDataSource(changedValues?.dataSourceId);
            }
          }}
        >
          <Row>
            <Col span={18}>
              <Form.Item
                rules={[
                  {
                    required: true,
                  },
                ]}
                name={'dataSourceId'}
                label={formatMessage({
                  id: 'odc.Database.AddDataBaseButton.DataSource',
                  defaultMessage: '数据源',
                })} /*所属数据源*/
              >
                <Select
                  showSearch
                  optionFilterProp="title"
                  loading={dataSourceListLoading || dataSourceLoading}
                  style={{
                    width: 'calc(100% - 10px)',
                  }}
                  placeholder={formatMessage({
                    id: 'odc.Database.AddDataBaseButton.PleaseSelect',
                    defaultMessage: '请选择',
                  })}
                  /*请选择*/ onChange={() =>
                    form.setFieldsValue({
                      databaseIds: [],
                    })
                  }
                >
                  {fileSystemDataSourceList?.map((item) => {
                    const icon = getDataSourceStyleByConnectType(item.type);
                    const isDisabled = !!item?.projectId && projectId !== item?.projectId;
                    return (
                      <Select.Option title={item.name} key={item.id} disabled={isDisabled}>
                        <Tooltip
                          title={
                            isDisabled
                              ? formatMessage(
                                  {
                                    id: 'odc.src.page.Project.Database.AddDataBaseButton.ThisDataSourceHasBeen',
                                    defaultMessage: '该数据源已绑定项目：{itemProjectName}',
                                  },
                                  {
                                    itemProjectName: item?.projectName,
                                  },
                                ) //`该数据源已绑定项目：${item?.projectName}`
                              : null
                          }
                        >
                          <Icon
                            component={icon?.icon?.component}
                            style={{
                              color: icon?.icon?.color,
                              fontSize: 16,
                              marginRight: 4,
                            }}
                          />

                          {item.name}
                        </Tooltip>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                requiredMark={false}
                label={formatMessage({
                  id: 'odc.Database.AddDataBaseButton.Environment',
                  defaultMessage: '环境',
                })} /*环境*/
              >
                <RiskLevelLabel
                  color={dataSource?.environmentStyle}
                  content={dataSource?.environmentName || '-'}
                />
              </Form.Item>
            </Col>
          </Row>
          <DatabaseOwnerSelect
            hasDefaultSet={false}
            ownerIds={form.getFieldValue('ownerIds')}
            setFormOwnerIds={(value) => {
              form.setFieldsValue({
                ownerIds: value,
              });
            }}
          />
        </Form>
      </Modal>
    </>
  );
};

export default AddObjectStorage;
