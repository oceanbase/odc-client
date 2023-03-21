import ConnectionPopover from '@/component/ConnectionPopover';
import { IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Popover, Select } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useContext, useEffect, useState } from 'react';
import { ManageContext } from '../../context';
import styles from './index.less';

const { Option } = Select;

interface IResourceOption {
  id: number;
  name: string;
  resourceIdentifier?: IManagerResourceType;
  action?: string;
  selected?: boolean;
}

const ResourceItem: React.FC<{
  name: number;
  fieldKey: number;
  values: {
    action: string;
    id: number;
    resourceIdentifier: string;
  }[];

  isRequired: boolean;
  showAction: boolean;
  formRef: React.RefObject<FormInstance>;
  connectionsOptions: IResourceOption[];
  resourceGroupsOptions: IResourceOption[];
  handleResourceChange: (type: IManagerResourceType) => void;
  remove: (name: number) => void;
  onFieldChange: (label: string, value: any) => void;
}> = ({
  name: fieldName,
  fieldKey,
  values,
  formRef,
  remove,
  isRequired,
  showAction,
  connectionsOptions,
  resourceGroupsOptions,
  ...rest
}) => {
  const resourcePermissions = formRef.current.getFieldValue('publicResourcePermissions');
  const [resourceType, setResourceType] = useState(() => {
    return values?.[fieldName]?.resourceIdentifier ?? '';
  });
  const [resourceOptions, setResourceOptions] = useState<IResourceOption[]>(() => {
    if (!resourceType) {
      return [];
    }
    return resourceType === IManagerResourceType.public_connection
      ? connectionsOptions
      : resourceGroupsOptions;
  });

  useEffect(() => {
    setResourceType(values?.[fieldName]?.resourceIdentifier ?? '');
  }, [values]);

  useEffect(() => {
    if (!resourceType) {
      return;
    }
    setResourceOptions(
      resourceType === IManagerResourceType.public_connection
        ? connectionsOptions
        : resourceGroupsOptions,
    );
  }, [connectionsOptions, resourceGroupsOptions]);

  const handleResourceTypeChange = (value) => {
    const resourcePermissions = formRef.current.getFieldValue('publicResourcePermissions');
    resourcePermissions[fieldName] = {
      resourceIdentifier: value,
      id: '',
      action: '',
    };

    setResourceType(value);
    rest.handleResourceChange(value);
    rest.onFieldChange('publicResourcePermissions', [...resourcePermissions]);
  };

  const handleResourceChange = () => {
    rest.handleResourceChange(resourceType as IManagerResourceType);
  };

  const handleRemove = () => {
    const resourcePermissions = formRef.current.getFieldValue('publicResourcePermissions');
    if (resourcePermissions.length === 1) {
      return false;
    }
    resourcePermissions.splice(fieldName, 1);
    remove(fieldName);
    rest.onFieldChange('publicResourcePermissions', [...resourcePermissions]);
    rest.handleResourceChange(resourceType as IManagerResourceType);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <Form.Item
        style={{ width: '100px', marginRight: 8 }}
        name={[fieldName, 'resourceIdentifier']}
        fieldKey={[fieldKey, 'resourceIdentifier']}
        rules={[
          {
            required: isRequired,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.Select',
            }),

            // 请选择
          },
        ]}
      >
        <Select onChange={handleResourceTypeChange}>
          <Select.Option value={IManagerResourceType.public_connection}>
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.component.PublicConnection',
              })

              /* 公共连接 */
            }
          </Select.Option>
          <Select.Option value={IManagerResourceType.resource_group}>
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.component.ResourceGroup',
              })

              /* 资源组 */
            }
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        style={{ flexGrow: 1, marginRight: 8 }}
        name={[fieldName, 'id']}
        fieldKey={[fieldName, 'id']}
        rules={[
          {
            required: isRequired,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.Select',
            }),

            // 请选择
          },
        ]}
      >
        <Select
          showSearch={true}
          filterOption={(value, option) => {
            return option?.title?.toLowerCase()?.indexOf(value?.toLowerCase()) >= 0;
          }}
          onChange={(value) => {
            handleResourceChange();
            rest.onFieldChange(`publicResourcePermissions.${fieldName}.id`, value);
          }}
        >
          {resourceOptions?.map((item) => {
            const { name, id, resourceIdentifier, selected } = item;
            return (
              <Option
                value={id}
                title={name}
                key={`${resourceIdentifier}${id}`}
                disabled={selected}
              >
                {resourceIdentifier === IManagerResourceType.public_connection ? (
                  <Popover
                    overlayClassName={styles.connectionPopover}
                    placement="left"
                    content={<ConnectionPopover connection={item} />}
                  >
                    <div className={styles.labelName}>{name}</div>
                  </Popover>
                ) : (
                  name
                )}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      {showAction && (
        <Form.Item
          style={{ width: '100px', marginRight: 8 }}
          name={[fieldName, 'action']}
          fieldKey={[fieldName, 'action']}
          rules={[
            {
              required: isRequired,
              message: formatMessage({
                id: 'odc.components.FormRoleModal.component.Select',
              }),

              // 请选择
            },
          ]}
        >
          <Select
            onChange={(value) => {
              rest.onFieldChange(`publicResourcePermissions.${fieldName}.action`, value);
            }}
          >
            <Select.Option value="readonlyconnect">
              {
                formatMessage({
                  id: 'odc.components.FormRoleModal.component.ReadOnly',
                })

                /* 只读 */
              }
            </Select.Option>
            <Select.Option value="connect">
              {
                formatMessage({
                  id: 'odc.components.FormRoleModal.component.ReadAndWrite',
                })

                /* 读写 */
              }
            </Select.Option>
            <Select.Option value="apply">
              {
                formatMessage({
                  id: 'odc.components.ResourceSelector.CanApply',
                }) /*可申请*/
              }
            </Select.Option>
          </Select>
        </Form.Item>
      )}

      {resourcePermissions.length === 1 ? null : <DeleteOutlined onClick={handleRemove} />}
    </div>
  );
};

export const ResourceSelector: React.FC<{
  initialValue: any;
  isEdit: boolean;
  isCopy: boolean;
  permissionType: string[];
  required?: boolean;
  showAction?: boolean;
  formRef: React.RefObject<FormInstance>;
  onFieldChange: (label: string, value: any) => void;
}> = (props) => {
  const {
    initialValue,
    isEdit,
    isCopy,
    required = true,
    formRef,
    permissionType,
    showAction = true,
    onFieldChange,
  } = props;
  const { publicResourcePermissions = [] } = initialValue ?? {};
  const [isRequired, setIsRequired] = useState(true);

  const { publicConnections, resourceGroups } = useContext(ManageContext);
  const [connectionsOptions, setConnectionsOptions] = useState<IResourceOption[]>(
    publicConnections?.contents ?? [],
  );

  const [resourceGroupsOptions, setResourceGroupsOptions] = useState<IResourceOption[]>(
    resourceGroups?.contents ?? [],
  );

  const handleFilteredOption = (
    selectedPublicResource: {
      action: string;
      id: number;
      resourceIdentifier: IManagerResourceType;
    }[],

    type: IManagerResourceType,
  ) => {
    const selectedResourceOptions = selectedPublicResource?.filter(
      (item) => item?.resourceIdentifier === type,
    );

    let currentResourceOptions;
    let setCurrentResourceOptions;
    if (type === IManagerResourceType.public_connection) {
      currentResourceOptions = connectionsOptions;
      setCurrentResourceOptions = setConnectionsOptions;
    } else {
      currentResourceOptions = resourceGroupsOptions;
      setCurrentResourceOptions = setResourceGroupsOptions;
    }
    const filteredOptions = currentResourceOptions?.map((item) => {
      const selected = selectedResourceOptions?.some(
        (selectedItem) => selectedItem?.id === item?.id,
      );

      return { ...item, resourceIdentifier: type, selected };
    });
    setCurrentResourceOptions(filteredOptions);
  };

  const handleResourceChange = (type: IManagerResourceType) => {
    const selectedResource = formRef.current.getFieldValue('publicResourcePermissions');
    handleFilteredOption(selectedResource, type);
  };

  useEffect(() => {
    if ((isEdit || isCopy) && initialValue) {
      handleFilteredOption(
        initialValue.publicResourcePermissions,
        IManagerResourceType.public_connection,
      );

      handleFilteredOption(
        initialValue.publicResourcePermissions,
        IManagerResourceType.resource_group,
      );
    }
  }, [isEdit, isCopy, initialValue]);

  useEffect(() => {
    if (permissionType.includes('publicResourcePermissions')) {
      const resource = formRef.current.getFieldValue('publicResourcePermissions');
      if (!resource?.length) {
        formRef.current.setFieldsValue({
          publicResourcePermissions: [
            {
              action: '',
              id: '',
              resourceIdentifier: '',
            },
          ],
        });
      }
    }
  }, [permissionType]);

  const handleValidator = async (_, values) => {
    let itemRequired = false;
    const validValues = values.filter((item) => {
      const { resourceIdentifier, id, action } = item ?? {};
      return showAction ? resourceIdentifier && id && action : resourceIdentifier && id;
    });
    const invalidValues = values.filter((item) => {
      const { resourceIdentifier, id, action } = item ?? {};
      return (resourceIdentifier || action || id) && !validValues?.find((value) => value.id === id);
    });
    if ((required && !validValues.length) || invalidValues.length) {
      itemRequired = true;
    }
    setIsRequired(itemRequired);
    return itemRequired ? Promise.reject(new Error()) : Promise.resolve();
  };

  return (
    <Form.List
      name="publicResourcePermissions"
      rules={[
        {
          validator: handleValidator,
        },
      ]}
    >
      {(fields, { add, remove }) => (
        <div className={styles.infoBlock}>
          {fields.map(({ key, name, fieldKey }: any) => (
            <ResourceItem
              key={key}
              name={name}
              fieldKey={fieldKey}
              values={publicResourcePermissions}
              connectionsOptions={connectionsOptions}
              resourceGroupsOptions={resourceGroupsOptions}
              handleResourceChange={handleResourceChange}
              isRequired={isRequired}
              showAction={showAction}
              formRef={formRef}
              remove={remove}
              onFieldChange={onFieldChange}
            />
          ))}

          <Form.Item style={{ marginBottom: 0, width: '640px' }}>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              {
                formatMessage({
                  id: 'odc.components.ResourceSelector.Add',
                }) /*添加*/
              }
            </Button>
          </Form.Item>
        </div>
      )}
    </Form.List>
  );
};
