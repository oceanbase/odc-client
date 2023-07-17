import HelpDoc from '@/component/helpDoc';
import { IResourceOption, ResourceSelector } from '@/component/Manage/ResourceSelector';
import { EnableRoleSystemPermission } from '@/constant';
import appConfig from '@/constant/appConfig';
import { IManagerResourceType, IManagerRolePermissionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Checkbox, Form, Space, Tabs, Tooltip, Typography } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { isUndefined } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { ResourceContext } from '../../../context';
import {
  createAbleResourceOptions,
  resourceManagementActionOptions,
  resourceManagementTypeOptions,
  systemActionOptions,
  systemTypeOptions,
} from './const';
import styles from './index.less';

const { TabPane } = Tabs;

const getOptions = (
  type: IManagerResourceType,
  data: {
    name: string;
    id: number;
    [key: string]: any;
  }[],
) => {
  return (
    data?.map((item) => {
      return {
        ...item,
        resourceType: type,
        resourceId: item?.id,
        name: item?.name,
      };
    }) ?? []
  );
};

const FormResourceSelector: React.FC<{
  initialValue: any;
  isEdit: boolean;
  isCopy: boolean;
  permissionActiveKey: string;
  formRef: React.RefObject<FormInstance>;
  handleFieldChange: (label: string, value: any) => void;
  handlePermissionTypeChange: (key: string) => void;
}> = (props) => {
  const {
    initialValue,
    isEdit,
    isCopy,
    permissionActiveKey,
    formRef,
    handleFieldChange,
    handlePermissionTypeChange,
  } = props;
  const { permissionType: initPermissionType = [], systemPermissions = {} } = initialValue ?? {};
  const [permissionType, setPermissionType] = useState([]);
  const { resource, roles, users } = useContext(ResourceContext);

  const [resourceManagementOptionsMap, setResourceManagementOptionsMap] = useState<{
    [key: string]: IResourceOption[];
  }>({
    [IManagerResourceType.resource]: getOptions(IManagerResourceType.resource, resource),
    [IManagerResourceType.user]: getOptions(IManagerResourceType.user, users),
    [IManagerResourceType.role]: getOptions(IManagerResourceType.role, roles),
  });

  useEffect(() => {
    if (initialValue) {
      setPermissionType(initPermissionType);
    }
  }, [initialValue]);

  const handleResourceManagementOptionsChange = (value) => {
    setResourceManagementOptionsMap(value);
  };

  const iconStyle = {
    color: 'var(--text-color-hint)',
  };

  return (
    <>
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormRoleModal.component.PermissionType',
        })}
        /* 权限类型 */
        name="permissionType"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.SelectAPermissionType',
            }),

            // 请选择权限类型
          },
        ]}
      >
        <Checkbox.Group
          onChange={(value: any) => {
            setPermissionType(value);
            handleFieldChange('permissionType', value);
            handlePermissionTypeChange(value[0]);
          }}
        >
          <Checkbox value={IManagerRolePermissionType.resourceManagementPermissions}>
            <Space size={5}>
              <span>
                {
                  formatMessage({
                    id: 'odc.components.FormResourceSelector.ResourceManagementPermissions',
                  }) /*资源管理权限*/
                }
              </span>
              <Tooltip title="包括数据源、项目、角色、用户的管理权限（新建/管理/编辑/查看）">
                <QuestionCircleOutlined style={iconStyle} />
              </Tooltip>
            </Space>
          </Checkbox>
          <Checkbox value={IManagerRolePermissionType.systemOperationPermissions}>
            <Space size={5}>
              <span>
                {
                  formatMessage({
                    id: 'odc.components.FormResourceSelector.SystemOperatingPermissions',
                  }) /*系统操作权限*/
                }
              </span>
              <Tooltip title="包括操作记录、系统配置、自动授权、审批流程、审批流程、风险识别规则、开发规范、系统集成的操作权限（查看/操作）">
                <QuestionCircleOutlined style={iconStyle} />
              </Tooltip>
            </Space>
          </Checkbox>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormRoleModal.component.PermissionSettings',
        })}
        /* 权限设置 */ className={styles.noOptional}
      >
        {permissionType.length ? (
          <Tabs activeKey={permissionActiveKey} type="card" onChange={handlePermissionTypeChange}>
            {EnableRoleSystemPermission &&
              permissionType.includes('resourceManagementPermissions') && (
                <TabPane
                  tab={formatMessage({
                    id: 'odc.components.FormResourceSelector.ResourceManagementPermissions',
                  })}
                  /*资源管理权限*/ key="resourceManagementPermissions"
                  forceRender
                >
                  <Form.Item
                    label={formatMessage({
                      id: 'odc.components.FormResourceSelector.ObjectsThatCanBeCreated',
                    })} /*可新建的对象*/
                    name="createAbleResource"
                    style={{ padding: '0 12px' }}
                  >
                    <Checkbox.Group
                      options={createAbleResourceOptions?.filter((item) =>
                        appConfig.manage.user.create
                          ? true
                          : item.value !== IManagerResourceType.user,
                      )}
                    />
                  </Form.Item>
                  <div className={styles['resource-header-sys']}>
                    <div style={{ width: '100px' }}>
                      {
                        formatMessage({
                          id: 'odc.components.FormResourceSelector.ManageableObjects',
                        }) /*可管理的对象*/
                      }
                    </div>
                    <div style={{ width: '108px' }}>
                      <HelpDoc doc="resourceManagementPermissionsAction" leftText>
                        {
                          formatMessage({
                            id: 'odc.components.FormResourceSelector.ManagePermissions',
                          }) /*管理权限*/
                        }
                      </HelpDoc>
                    </div>
                  </div>
                  <Form.Item name="resourceManagementPermissions">
                    <ResourceSelector
                      name="resourceManagementPermissions"
                      optionsMap={resourceManagementOptionsMap}
                      typeOptions={resourceManagementTypeOptions}
                      actionOptions={resourceManagementActionOptions}
                      initialValue={initialValue}
                      isEdit={isEdit}
                      isCopy={isCopy}
                      formRef={formRef}
                      required={false}
                      onFieldChange={handleFieldChange}
                      onOptionsChange={handleResourceManagementOptionsChange}
                    />
                  </Form.Item>
                </TabPane>
              )}

            {permissionType.includes('systemOperationPermissions') && (
              <TabPane
                tab={formatMessage({
                  id: 'odc.components.FormResourceSelector.SystemOperatingPermissions',
                })}
                /*系统操作权限*/ key="systemOperationPermissions"
                forceRender
              >
                <div className={styles['resource-header']}>
                  <div style={{ width: '100px' }}>
                    {
                      formatMessage({
                        id: 'odc.components.FormResourceSelector.OperationalType',
                      }) /*可操作的类型*/
                    }
                  </div>
                  <div style={{ width: '108px' }}>
                    <HelpDoc doc="systemOperationPermissionsAction" leftText>
                      {
                        formatMessage({
                          id: 'odc.components.FormResourceSelector.OperationPermission',
                        }) /*操作权限*/
                      }
                    </HelpDoc>
                  </div>
                </div>
                <Form.Item
                  name="systemOperationPermissions"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.components.FormRoleModal.component.SelectPermissions',
                      }),
                      // 请选择权限
                    },
                  ]}
                >
                  <ResourceSelector
                    name="systemOperationPermissions"
                    showField={false}
                    typeOptions={systemTypeOptions?.filter((item) =>
                      !isUndefined(item.visible) ? item.visible : true,
                    )}
                    actionOptions={systemActionOptions}
                    initialValue={initialValue}
                    isEdit={isEdit}
                    isCopy={isCopy}
                    formRef={formRef}
                    onFieldChange={handleFieldChange}
                  />
                </Form.Item>
              </TabPane>
            )}
          </Tabs>
        ) : (
          <Typography.Text type="secondary">
            {
              formatMessage({
                id: 'odc.components.FormResourceSelector.NoPermissionTypeSelected',
              }) /*未选择权限类型*/
            }
          </Typography.Text>
        )}
      </Form.Item>
    </>
  );
};

export default FormResourceSelector;
