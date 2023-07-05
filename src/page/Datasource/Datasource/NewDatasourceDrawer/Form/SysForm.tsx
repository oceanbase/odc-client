import FormItemPanel from '@/component/FormItemPanel';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Checkbox, Col, Form, Input, InputRef, Row, Typography } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { useContext, useEffect, useRef, useState } from 'react';
import DatasourceFormContext from './context';
import styles from './index.less';

interface IProps {
  isEdit: boolean;
  sysAccountExist: boolean;
  formRef: FormInstance;
}

export default (props: IProps) => {
  const { formRef, isEdit, sysAccountExist } = props;
  const [sysPasswordIsEditing, setSysPasswordIsEditing] = useState(false);
  const sysInput = useRef<InputRef>();
  const formContext = useContext(DatasourceFormContext);
  const isSysPwdCopyMode = isEdit;
  const sysPasswordEditable = isSysPwdCopyMode && sysAccountExist ? sysPasswordIsEditing : true;

  useEffect(() => {
    formRef.setFieldsValue({
      useSys: sysAccountExist,
    });
  }, [sysAccountExist]);

  if (haveOCP()) {
    return null;
  }
  return (
    <>
      <Form.Item name="useSys" valuePropName="checked" style={{ marginBottom: 0 }}>
        <Checkbox>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.SysForm.UseTheSysTenantAccount',
            })
            /*使用 sys 租户账号查询租户视图*/
          }
        </Checkbox>
      </Form.Item>
      <Row>
        <Typography.Text type="secondary">
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.SysForm.TheExportAndDerivativeSpeed',
            }) /*部分对象的导出和导数速度提升均依赖该账号*/
          }
        </Typography.Text>
      </Row>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const useSys = getFieldValue('useSys');
          if (!useSys) {
            return null;
          }
          return (
            <FormItemPanel keepExpand>
              <div className={styles.inlineForm}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      hasFeedback
                      label={formatMessage({
                        id: 'odc.AddConnectionDrawer.AddConnectionForm.Account',
                      })}
                      name="sysTenantUsername"
                    >
                      <Input
                        autoComplete="new-account"
                        ref={sysInput}
                        placeholder={formatMessage({
                          id: 'odc.AddConnectionDrawer.AddConnectionForm.Enter',
                        })}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      hasFeedback
                      label={formatMessage({
                        id: 'odc.AddConnectionDrawer.AddConnectionForm.Password',
                      })}
                      name="sysTenantPassword"
                    >
                      {!isSysPwdCopyMode || !sysAccountExist || sysPasswordIsEditing ? (
                        <Input.Password
                          disabled={!sysPasswordEditable}
                          autoComplete="new-password"
                          visibilityToggle={false}
                          placeholder={formatMessage({
                            id: 'odc.AddConnectionDrawer.AddConnectionForm.Enter',
                          })}
                        />
                      ) : (
                        <>
                          <Input value="******" disabled />
                        </>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <a
                  style={{
                    marginRight: 8,
                  }}
                  onClick={async () => {}}
                >
                  {formatMessage({
                    id: 'portal.connection.form.test',
                  })}
                </a>
                {isSysPwdCopyMode &&
                  sysAccountExist &&
                  (sysPasswordIsEditing ? (
                    <a
                      onClick={() => {
                        setSysPasswordIsEditing(false);

                        formContext.form?.setFieldsValue({
                          sysTenantPassword: null,
                        });
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.AddConnectionDrawer.AddConnectionForm.CancelModification',
                        })

                        /* 取消修改 */
                      }
                    </a>
                  ) : (
                    <a
                      onClick={() => {
                        setSysPasswordIsEditing(true);
                        formContext.form?.setFieldsValue({
                          sysTenantPassword: '',
                        });
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.AddConnectionDrawer.AddConnectionForm.ChangePassword',
                        })

                        /* 修改密码 */
                      }
                    </a>
                  ))}
              </div>
            </FormItemPanel>
          );
        }}
      </Form.Item>
    </>
  );
};
