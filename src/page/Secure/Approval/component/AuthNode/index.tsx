import { formatMessage } from '@/util/intl';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Space, Timeline } from 'antd';
import React from 'react';
import { NodeSelector } from '../NodeSelector';
import styles from './index.less';

interface IAuthNodeProps {
  roles: any[];
  integrations: any[];
}

export const AuthNode: React.FC<IAuthNodeProps> = (props) => {
  const { roles, integrations } = props;

  const handleValid = async (_, values) => {
    return !values?.length ? Promise.reject(new Error()) : Promise.resolve();
  };

  return (
    <>
      <Form.List
        name="nodes"
        rules={[
          {
            validator: handleValid,
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <Timeline className={styles.authNode}>
            {fields.map((field, index) => (
              <Timeline.Item
                className={index === fields?.length - 1 && styles.preLastItem}
                key={field.key}
              >
                <Space direction="vertical">
                  <Space>
                    <span>
                      {formatMessage({ id: 'odc.component.AuthNode.ApprovalNode' }) /*审批节点*/}
                      {index + 1}
                    </span>
                    <Form.Item
                      name={[field.name, 'externalApproval']}
                      valuePropName="checked"
                      noStyle
                    >
                      <Checkbox>
                        {
                          formatMessage({
                            id: 'odc.component.AuthNode.ExternalApproval',
                          }) /*外部审批*/
                        }
                      </Checkbox>
                    </Form.Item>
                  </Space>
                  <Space>
                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue }) => {
                        const fieldkey = ['nodes', field.name, 'externalApproval'];
                        const isExternalApproval = getFieldValue(fieldkey);
                        const approvalNodes = getFieldValue('nodes');
                        const nodes = isExternalApproval ? integrations : roles;
                        const name = isExternalApproval ? 'externalApprovalId' : 'resourceRoleId';
                        const selectedNodes = nodes
                          ?.filter((item) =>
                            approvalNodes?.find((node) => node?.[name] === item?.id),
                          )
                          ?.map((item) => ({
                            id: item.id,
                            name: item.name,
                          }));
                        const title = isExternalApproval
                          ? formatMessage({ id: 'odc.component.AuthNode.ExternalIntegration' }) //外部集成
                          : formatMessage({ id: 'odc.component.AuthNode.Role' }); //角色
                        return (
                          <NodeSelector
                            title={title}
                            name={[field.name, name]}
                            selectedNodes={selectedNodes}
                            nodes={nodes}
                          />
                        );
                      }}
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue }) => {
                        const fieldkey = ['nodes', field.name, 'externalApproval'];
                        const isExternalApproval = getFieldValue(fieldkey);
                        return (
                          <Form.Item
                            name={[field.name, 'autoApproval']}
                            valuePropName="checked"
                            noStyle
                          >
                            <Checkbox disabled={isExternalApproval}>
                              {
                                formatMessage({
                                  id: 'odc.component.AuthNode.AutomaticApproval',
                                }) /*自动审批*/
                              }
                            </Checkbox>
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                    {fields.length > 1 ? (
                      <DeleteOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </Space>
                </Space>
              </Timeline.Item>
            ))}
            <Timeline.Item className={styles.opBtn}>
              <Space split={<span className={styles.desc}>|</span>}>
                <Button type="link" onClick={() => add({ autoApproval: false })}>
                  {
                    formatMessage({
                      id: 'odc.component.AuthNode.AddAnApprovalNode',
                    }) /*添加审批节点*/
                  }
                </Button>
              </Space>
              <Form.ErrorList errors={errors} />
            </Timeline.Item>
          </Timeline>
        )}
      </Form.List>
    </>
  );
};
