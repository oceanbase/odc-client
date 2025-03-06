/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ConnectionPopover from '@/component/ConnectionPopover';
import { IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Popover, Select, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const { Option } = Select;

export const ALL_SELECTED_ID = 'ALL';
export const ALL_I_HAVE_CREATED_ID = 'ALL_I_HAVE_CREATED_ID';
export const ALL_SELECTED_VALUE = '*';
export const ALL_I_HAVE_CREATED_VALUE = 'CREATOR';

export const AllOption: IResourceOption = {
  name: '全部',
  resourceId: ALL_SELECTED_ID,
};

export const AllIHaveCreatedOption: IResourceOption = {
  name: '我创建的',
  resourceId: ALL_I_HAVE_CREATED_ID,
};

export const isSelectedAll = (id: number | string) => {
  return id === ALL_SELECTED_ID;
};

export const isSelectedAllThatIHaveCreated = (id: number | string) => {
  return id === ALL_I_HAVE_CREATED_ID;
};

export const staticSelectedMap = {
  [ALL_SELECTED_ID]: ALL_SELECTED_VALUE,
  [ALL_I_HAVE_CREATED_ID]: ALL_I_HAVE_CREATED_VALUE,
};

export interface IResourceOption {
  resourceId: number | string;
  name: string;
  resourceType?: IManagerResourceType;
  actions?: string;
  selected?: boolean;
}

const ResourceItem: React.FC<{
  name: number;
  parentName: string;
  fieldKey: number;
  values: {
    actions: string;
    resourceId: number;
    resourceType: string;
  }[];

  isRequired: boolean;
  showAction: boolean;
  showRemove: boolean;
  showField: boolean;
  optionsMap: {
    [key: string]: IResourceOption[];
  };

  typeOptions: {
    label: string;
    value: IManagerResourceType;
  }[];

  actionOptions: {
    label: string;
    value: string;
    enableKeys?: IManagerResourceType[];
  }[];

  allSelecteField: {
    index: number;
    type: IManagerResourceType;
  };
  allICreatedSelecteField: {
    index: number;
    type: IManagerResourceType;
  };

  onRemove: (name: number) => void;
  onTypeChange: (index: number, type: IManagerResourceType) => void;
  onFieldChange: (type: IManagerResourceType) => void;
  onSelectAllFields: (type: IManagerResourceType, index: number, selected: boolean) => void;
  onSelectAllICreatedFields: (type: IManagerResourceType, index: number, selected: boolean) => void;
}> = ({
  name: fieldName,
  parentName,
  fieldKey,
  values,
  isRequired,
  showAction,
  showRemove,
  showField,
  optionsMap,
  typeOptions,
  actionOptions,
  allSelecteField,
  allICreatedSelecteField,
  onRemove,
  onTypeChange,
  onFieldChange,
  onSelectAllFields,
  onSelectAllICreatedFields,
}) => {
  const [type, setType] = useState(() => {
    return values?.[fieldName]?.resourceType ?? '';
  });
  const [isSelectAll, setIsSelectAll] = useState(() => {
    return isSelectedAll(values?.[fieldName]?.resourceId);
  });
  const [isSelectedAllIHaveCreated, setIsSelectedAllIHaveCreated] = useState(() => {
    return isSelectedAllThatIHaveCreated(values?.[fieldName]?.resourceId);
  });
  const [open, setOpen] = useState(false);
  const enableSelectAll = !(
    parentName === 'connectionAccessPermissions' && type === IManagerResourceType.resource
  );

  const fieldOptions = optionsMap?.[type] ?? [];
  const disableSelectAll = allSelecteField?.type === type && allSelecteField?.index !== fieldName;
  const disableSelectAllICreated =
    allICreatedSelecteField?.type === type && allICreatedSelecteField?.index !== fieldName;
  const allFieldOptions = fieldOptions?.length
    ? fieldOptions.concat([AllOption, AllIHaveCreatedOption])
    : fieldOptions;
  const hasEnableKeys = actionOptions.some((item) => item?.enableKeys?.length);
  const enabledActionOptions = !hasEnableKeys
    ? actionOptions
    : actionOptions?.filter((item) => item?.enableKeys?.includes(type as IManagerResourceType));
  const handleChange = () => {
    onFieldChange(type as IManagerResourceType);
  };

  const handleTypeChange = (value) => {
    setType(value);
    onTypeChange(fieldName, value as IManagerResourceType);
    setIsSelectedAllIHaveCreated(false);
    setIsSelectAll(false);
  };

  const handleRemove = () => {
    onRemove(fieldName);
    handleChange();
  };

  const handleSelectAllFields = () => {
    setIsSelectAll(!isSelectAll);
    setIsSelectedAllIHaveCreated(false);
    onSelectAllFields(type as IManagerResourceType, fieldName, !isSelectAll);
    setOpen(false);
  };

  const handleSelectAllIHaveCreatedFields = () => {
    setIsSelectedAllIHaveCreated(!isSelectedAllIHaveCreated);
    setIsSelectAll(false);
    onSelectAllICreatedFields(type as IManagerResourceType, fieldName, !isSelectedAllIHaveCreated);
    setOpen(false);
  };

  useEffect(() => {
    if (values) {
      setType(values?.[fieldName]?.resourceType ?? '');
    }
  }, [values]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <Form.Item
        style={showField ? { width: '100px', marginRight: 8 } : { flexGrow: 1, marginRight: 8 }}
        name={[fieldName, 'resourceType']}
        fieldKey={[fieldKey, 'resourceType']}
        rules={[
          {
            required: isRequired,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.Select',
              defaultMessage: '请选择',
            }),

            // 请选择
          },
        ]}
      >
        <Select options={typeOptions} onChange={handleTypeChange} />
      </Form.Item>
      {showField && (
        <Form.Item
          style={{ flexGrow: 1, marginRight: 8 }}
          name={[fieldName, 'resourceId']}
          fieldKey={[fieldName, 'resourceId']}
          rules={[
            {
              required: isRequired,
              message: formatMessage({
                id: 'odc.components.FormRoleModal.component.Select',
                defaultMessage: '请选择',
              }),

              // 请选择
            },
          ]}
        >
          <Select
            showSearch={true}
            open={open}
            filterOption={(value, option) => {
              return option?.title?.toLowerCase()?.indexOf(value?.toLowerCase()) >= 0;
            }}
            onChange={handleChange}
            onDropdownVisibleChange={(visible) => {
              setOpen(visible);
            }}
            dropdownRender={
              enableSelectAll
                ? (menu) => (
                    <>
                      {menu}
                      {!!fieldOptions?.length && (
                        <>
                          <Divider style={{ margin: '8px 0' }} />
                          <Button
                            type="link"
                            disabled={disableSelectAll}
                            onClick={handleSelectAllFields}
                          >
                            {
                              !isSelectAll
                                ? formatMessage({
                                    id: 'odc.components.ResourceSelector2.All',
                                    defaultMessage: '全部',
                                  }) //全部
                                : formatMessage({
                                    id: 'odc.components.ResourceSelector2.CancelAll',
                                    defaultMessage: '取消全部',
                                  }) //取消全部
                            }
                          </Button>
                          <Button
                            type="link"
                            disabled={disableSelectAllICreated}
                            onClick={handleSelectAllIHaveCreatedFields}
                          >
                            {!isSelectedAllIHaveCreated ? '我创建的' : '取消我创建的'}
                          </Button>
                        </>
                      )}
                    </>
                  )
                : null
            }
          >
            {allFieldOptions?.map((item) => {
              const { name, resourceId, resourceType, selected } = item;
              return (
                <Option
                  className={
                    isSelectedAll(resourceId) || isSelectedAllThatIHaveCreated(resourceId)
                      ? styles.hide
                      : null
                  }
                  value={resourceId}
                  title={name}
                  key={`${resourceType}${resourceId}`}
                  disabled={isSelectAll || selected || isSelectedAllIHaveCreated}
                >
                  {resourceType === IManagerResourceType.resource ? (
                    <Popover
                      overlayClassName={styles.connectionPopover}
                      placement="left"
                      content={<ConnectionPopover connection={item} />}
                    >
                      <div className={styles.labelName}>{name}</div>
                    </Popover>
                  ) : resourceType === IManagerResourceType.user ? (
                    <Popover
                      placement="left"
                      content={
                        <Space direction="vertical">
                          <span>
                            {
                              formatMessage(
                                {
                                  id: 'odc.components.ResourceSelector2.NameName',
                                  defaultMessage: '姓名：{name}',
                                },
                                { name },
                              )
                              /*姓名：{name}*/
                            }
                          </span>
                          <span>
                            {
                              formatMessage({
                                id: 'odc.components.ResourceSelector2.Account',
                                defaultMessage: '账号：',
                              }) /*账号：*/
                            }

                            {(item as any)?.accountName}
                          </span>
                        </Space>
                      }
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
      )}

      {showAction && (
        <Form.Item
          style={{ width: '100px', marginRight: 8 }}
          name={[fieldName, 'actions']}
          fieldKey={[fieldName, 'actions']}
          rules={[
            {
              required: isRequired,
              message: formatMessage({
                id: 'odc.components.FormRoleModal.component.Select',
                defaultMessage: '请选择',
              }),

              // 请选择
            },
          ]}
        >
          <Select options={enabledActionOptions} onChange={handleChange} />
        </Form.Item>
      )}

      {showRemove && <DeleteOutlined onClick={handleRemove} />}
    </div>
  );
};

export const ResourceSelector: React.FC<{
  name: string;
  initialValue: any;
  isEdit: boolean;
  isCopy: boolean;
  required?: boolean;
  showAction?: boolean;
  showField?: boolean;
  optionsMap?: {
    [key: string]: IResourceOption[];
  };

  typeOptions: {
    label: string;
    value: IManagerResourceType;
  }[];

  actionOptions: {
    label: string;
    value: string;
  }[];

  formRef: React.RefObject<FormInstance>;
  onFieldChange: (label: string, value: any) => void;
  // 是否可以考虑在 onFieldChange 中设置
  onOptionsChange?: (value: { [key: string]: IResourceOption[] }) => void;
}> = (props) => {
  const {
    name,
    typeOptions,
    actionOptions,
    initialValue,
    isEdit,
    isCopy,
    required = true,
    formRef,
    showAction = true,
    showField = true,
    optionsMap,
    onFieldChange,
    onOptionsChange,
  } = props;
  const resource = initialValue?.[name] ?? [];
  const [isRequired, setIsRequired] = useState(true);
  const [allSelecteField, setAllSelecteField] = useState<{
    index: number;
    type: IManagerResourceType;
  }>(null);
  const [allICreatedSelecteField, setAllICreatedSelecteField] = useState<{
    index: number;
    type: IManagerResourceType;
  }>(null);
  const handleFilteredOption = (
    selectedPublicResource: {
      actions: string;
      // 需要去重的 key，动态化
      resourceId: number;
      resourceType: IManagerResourceType;
    }[],

    type: IManagerResourceType,
  ) => {
    const selectedResourceOptions = selectedPublicResource?.filter(
      (item) => item?.resourceType === type,
    );

    const filteredOptions = optionsMap?.[type]?.map((item) => {
      const selected = selectedResourceOptions?.some(
        (selectedItem) =>
          isSelectedAll(selectedItem?.resourceId) || selectedItem?.resourceId === item?.resourceId,
      );

      return { ...item, resourceType: type, selected };
    });
    onOptionsChange?.({
      ...optionsMap,
      [type]: filteredOptions,
    });
  };

  const handleFieldChange = (type: IManagerResourceType) => {
    const selectedResource = formRef.current.getFieldValue(name);
    handleFilteredOption(selectedResource, type);
  };

  useEffect(() => {
    if (showField && (isEdit || isCopy) && initialValue) {
      handleFilteredOption(initialValue?.[name], IManagerResourceType.resource);
    }
  }, [isEdit, isCopy, initialValue, showField]);

  // 有效性校验
  const handleValidator = async (_, values) => {
    let itemRequired = false;
    if (!values?.length) {
      return Promise.resolve();
    }
    const validValues = values.filter((item) => {
      // 每一项均不是空值
      return Object.values(item)?.every((value) => value);
    });
    const invalidValues = values.filter((item) => {
      const _values = Object.values(item);
      if (!_values.length) {
        return false;
      }
      // 包含空值 && 不是所有筛选项为空
      return _values?.some((value) => !value) && !_values?.every((value) => !value);
    });
    if ((required && !validValues.length) || invalidValues.length) {
      itemRequired = true;
    }
    setIsRequired(itemRequired);
    return itemRequired ? Promise.reject(new Error()) : Promise.resolve();
  };

  const handleTypeChange = (index, value: IManagerResourceType) => {
    const resourcePermissions = formRef.current.getFieldValue(name);
    const resetValue = {
      resourceType: value,
      resourceId: '',
      actions: '',
    };

    if (!showField) {
      delete resetValue.resourceId;
    }
    if (!showAction) {
      delete resetValue.actions;
    }
    resourcePermissions[index] = {
      ...resetValue,
    };

    onFieldChange(name, [...resourcePermissions]);
    handleFieldChange(value);
  };

  const selectionTypeConfig = {
    all: {
      getResourceId: (selected: boolean) => (selected ? ALL_SELECTED_ID : ''),
      setState: (selected: boolean, type: IManagerResourceType, index: number) =>
        setAllSelecteField(selected ? { type, index } : null),
    },
    created: {
      getResourceId: (selected: boolean) => (selected ? ALL_I_HAVE_CREATED_ID : ''),
      setState: (selected: boolean, type: IManagerResourceType, index: number) =>
        setAllICreatedSelecteField(selected ? { type, index } : null),
    },
  };

  const handleSelectFields = (
    type: IManagerResourceType,
    index: number,
    selected: boolean,
    selectionType: 'all' | 'created',
  ) => {
    const resourcePermissions = formRef.current.getFieldValue(name);

    const config = selectionTypeConfig[selectionType];

    const resourceIdValue = config.getResourceId(selected);

    const resetValue = {
      ...resourcePermissions[index],
      resourceId: resourceIdValue,
    };

    resourcePermissions[index] = {
      ...resetValue,
    };

    const selectedResource = optionsMap?.[type]?.map((item) => ({
      ...item,
      selected,
    }));

    formRef.current.setFields([
      {
        name: [name, index, 'resourceId'],
        errors: [],
      },
    ]);

    config.setState(selected, type, index);

    onFieldChange(name, [...resourcePermissions]);
    onOptionsChange?.({
      ...optionsMap,
      [type]: selectedResource,
    });
  };

  return (
    <Form.List
      name={name}
      rules={[
        {
          validator: handleValidator,
        },
      ]}
    >
      {(fields, { add, remove }) => {
        return (
          <div className={styles.infoBlock}>
            {fields.map(({ key, name: _name, fieldKey }: any) => (
              <ResourceItem
                key={key}
                parentName={name}
                name={_name}
                fieldKey={fieldKey}
                values={resource}
                optionsMap={optionsMap}
                typeOptions={typeOptions}
                actionOptions={actionOptions}
                isRequired={isRequired}
                showAction={showAction}
                showField={showField}
                showRemove={required ? fields?.length !== 1 : true}
                allSelecteField={allSelecteField}
                allICreatedSelecteField={allICreatedSelecteField}
                onRemove={remove}
                onTypeChange={handleTypeChange}
                onFieldChange={handleFieldChange}
                onSelectAllFields={(...args) => handleSelectFields(...args, 'all')}
                onSelectAllICreatedFields={(...args) => handleSelectFields(...args, 'created')}
              />
            ))}

            <Form.Item style={{ marginBottom: 0, width: '640px' }}>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                {
                  formatMessage({
                    id: 'odc.components.ResourceSelector2.Add',
                    defaultMessage: '添加',
                  }) /*添加*/
                }
              </Button>
            </Form.Item>
          </div>
        );
      }}
    </Form.List>
  );
};
