import { getConnectionExists } from '@/common/network/connection';
import {
  IConnectionLabel,
  IConnectionType,
  IManagerPublicConnection,
  IManagerResourceGroup,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import type { RadioChangeEvent } from 'antd';
import { Form, Input, Radio, Select, Space } from 'antd';
import React, { useCallback } from 'react';
import styles from './index.less';
const Option = Select.Option;

interface INameItemsProps {
  isPrivate: boolean;
  isOrganization: boolean;
  baseWidth: number;
  onlySys: boolean;
  isEdit: boolean;
  formData: Partial<IManagerPublicConnection>;
  resourceList?: IManagerResourceGroup[];
  connectionType: IConnectionType;
  labels?: IConnectionLabel[];
  extendData: Record<string, any>;
  onChangeExtendData: (values: any) => void;
  handleChangeFormData: (values: Record<string, any>) => void;
  onChangeLabelManageVisible?: (visible: boolean) => void;
  handleStatusChange?: (
    status: boolean,
    connection: IManagerPublicConnection,
    callback: () => void,
  ) => void;
}

const NameItems: React.FC<INameItemsProps> = (props) => {
  const {
    baseWidth,
    onlySys,
    isEdit,
    resourceList,
    isOrganization,
    connectionType,
    handleStatusChange,
    handleChangeFormData,
  } = props;

  const checkNameRepeat = useCallback(
    async (ruler, value) => {
      const isRepeat = await getConnectionExists({
        name: value,
        visibleScope: connectionType,
      });

      if (isRepeat) {
        throw new Error();
      }
    },
    [connectionType],
  );

  const statusChangeHandle = useCallback(
    (e: RadioChangeEvent) => {
      if (!e.target.value && isEdit) {
        handleStatusChange(e.target.value, null, () => {
          handleChangeFormData({
            enabled: true,
          });
        });
      }
    },
    [isEdit, handleStatusChange, handleChangeFormData],
  );

  return (
    <>
      {!isOrganization && !isEdit ? null : (
        <Form.Item
          className={styles.noRequiredMark}
          label={formatMessage({
            id: 'portal.connection.form.name',
          })}
        >
          <Space>
            <Form.Item
              noStyle
              name="name"
              validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.component.AddConnectionForm.NameItems.EnterAConnectionName',
                  }), //请输入连接名称
                },
                {
                  max: 128,
                  message: formatMessage({
                    id: 'odc.component.AddConnectionForm.NameItems.TheMaximumLengthOfThe',
                  }), //连接名称最大长度为 128
                },
                {
                  validator: validTrimEmptyWithWarn(
                    formatMessage({
                      id: 'odc.component.AddConnectionForm.NameItems.TheConnectionNameContainsSpaces',
                    }), //连接名称首尾包含空格
                  ),
                },
                {
                  message: formatMessage({
                    id: 'odc.component.AddConnectionForm.TheConnectionNameAlreadyExists',
                  }),
                  // 连接名称已存在
                  validator: !isEdit && checkNameRepeat,
                },
              ]}
            >
              <Input
                disabled={onlySys}
                style={{
                  width: baseWidth,
                }}
                placeholder={formatMessage({
                  id: 'odc.component.AddConnectionForm.NameItems.EnterAConnectionNameLess.1',
                })} /*请输入连接名称，128字以内*/
              />
            </Form.Item>
          </Space>
        </Form.Item>
      )}

      {isOrganization && (
        <>
          <Form.Item
            label={formatMessage({
              id: 'odc.component.AddConnectionForm.ResourceGroup',
            })}
            /* 所属资源组 */ name="resourceGroups"
          >
            <Select
              mode="multiple"
              style={{
                width: baseWidth,
              }}
              showSearch={true}
              filterOption={(value, option) => {
                return option?.props?.children?.indexOf(value) >= 0;
              }}
              notFoundContent={formatMessage({
                id: 'odc.component.AddConnectionForm.NoResourceGroupIsAvailable',
              })}
              /* 暂无资源组，请在资源组管理中创建 */
            >
              {resourceList?.map(({ name, id }) => (
                <Option value={id}>{name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.component.AddConnectionForm.ConnectionStatus',
            })}
            /* 连接状态 */
            name="enabled"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.AddConnectionForm.SelectAStatus',
                }),

                // 请选择状态
              },
            ]}
          >
            <Radio.Group onChange={statusChangeHandle}>
              <Radio value={true}>
                {
                  formatMessage({
                    id: 'odc.component.AddConnectionForm.Enable',
                  })

                  /* 启用 */
                }
              </Radio>
              <Radio value={false}>
                {
                  formatMessage({
                    id: 'odc.component.AddConnectionForm.Disable',
                  })

                  /* 停用 */
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
        </>
      )}
    </>
  );
};

export default NameItems;
