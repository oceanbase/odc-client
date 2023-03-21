import { IConnectionType } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { Form, Input, Radio } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { inject, observer } from 'mobx-react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import RAMAuthAlertInfo from '../RAMAuthAlertInfo';
import ConnectionSelector from './component/connectionSelector';

export interface IPermissionData {
  [key: string]: any;
}

interface IProps {
  connectionStore?: ConnectionStore;
  ref?: React.Ref<FormInstance>;
}

const PermissionForm: React.FC<IProps> = inject('connectionStore')(
  observer(
    forwardRef((props, ref) => {
      const { connectionStore } = props;
      const [connections, setConnections] = useState([]);
      const [form] = Form.useForm<IPermissionData>();

      useImperativeHandle(ref, () => form);

      const loadData = async () => {
        const res = await connectionStore.getList({
          visibleScope: IConnectionType.ORGANIZATION,
          minPrivilege: 'apply',
        });

        setConnections(res?.contents);
      };

      const handleConnectionChange = (ids: number[]) => {
        const values = connections
          ?.filter((item) => ids.includes(item.id))
          ?.map((item) => {
            return {
              resourceId: item.id,
              resourceType: 'ODC_CONNECTION',
            };
          });

        form.setFieldsValue({
          connections: values,
        });
      };

      useEffect(() => {
        loadData();
      }, []);

      return (
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            permissionType: 'readonlyconnect',
          }}
        >
          <Form.Item
            name="connections"
            label={formatMessage({
              id: 'odc.component.ApplyPermission.form.SelectPublicConnection',
            })}
            /*选择公共连接*/ required
          >
            <RAMAuthAlertInfo />
            <ConnectionSelector connections={connections} onChange={handleConnectionChange} />
          </Form.Item>
          <Form.Item
            name="permissionType"
            label={formatMessage({
              id: 'odc.component.ApplyPermission.form.PermissionType',
            })}
            /*申请权限类型*/ required
          >
            <Radio.Group>
              <Radio value="readonlyconnect">
                {
                  formatMessage({
                    id: 'odc.component.ApplyPermission.form.ReadOnly',
                  }) /*只读*/
                }
              </Radio>
              <Radio value="connect">
                {
                  formatMessage({
                    id: 'odc.component.ApplyPermission.form.ReadWriteIncludingReadOnly',
                  }) /*读写（包含只读）*/
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="description"
            label={formatMessage({
              id: 'odc.component.ApplyPermission.form.ReasonForApplication',
            })} /*申请原因*/
          >
            <Input.TextArea
              rows={5}
              placeholder={formatMessage({
                id: 'odc.component.ApplyPermission.form.PleaseEnterTheReasonFor',
              })} /*请输入申请原因*/
            />
          </Form.Item>
        </Form>
      );
    }),
  ),
);

export default PermissionForm;
