import { formatMessage } from '@/util/intl';
import { Alert, Form, Radio } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React from 'react';
import { ResourceSelector } from '../ResourceSelector';

interface IProps {
  formRef: React.RefObject<FormInstance>;
  isActive: boolean;
  isEdit: boolean;
  isCopy: boolean;
  initialValue: Record<string, any>;
}

const ResourceForm: React.FC<IProps> = (props) => {
  const { formRef, isActive, isEdit, isCopy, initialValue } = props;

  const handleFieldChange = (label: string, value: any) => {
    formRef.current.setFieldsValue({
      [label]: value,
    });
  };

  return (
    <Form
      ref={formRef}
      style={{ display: isActive ? 'block' : 'none' }}
      layout="vertical"
      requiredMark="optional"
      initialValues={initialValue}
    >
      <Alert
        message={formatMessage({
          id: 'odc.components.FormTaskModal.resourceForm.TheAssociatedConnectionMatchesThe',
        })} /*关联的连接将默认匹配当前流程；如需修改，可在流程管理列表设置流程优先级*/
        type="info"
        showIcon
      />

      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormTaskModal.resourceForm.AssociatedConnection',
        })}
        /*关联连接*/ name="associateAll"
        required
      >
        <Radio.Group>
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.components.FormTaskModal.resourceForm.PartialPublicConnection',
              }) /*部分公共连接*/
            }
          </Radio>
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.components.FormTaskModal.resourceForm.AllPublicConnections',
              }) /*全部公共连接*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const associateAll = getFieldValue('associateAll');
          return !associateAll ? (
            <Form.Item
              label={formatMessage({
                id: 'odc.components.FormTaskModal.resourceForm.SelectResources',
              })} /*选择资源*/
            >
              <ResourceSelector
                initialValue={initialValue}
                permissionType={['publicResourcePermissions']}
                isEdit={isEdit}
                isCopy={isCopy}
                required={false}
                formRef={formRef}
                showAction={false}
                onFieldChange={handleFieldChange}
              />
            </Form.Item>
          ) : null;
        }}
      </Form.Item>
    </Form>
  );
};

export default ResourceForm;
