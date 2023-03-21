import FormItemPanel from '@/component/FormItemPanel';
import { AccountType, IConnectionTestErrorType } from '@/d.ts';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithErrorWhenNeed } from '@/util/valid';
import { Checkbox, Col, Form, Input, InputRef, message, Row, Typography } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useEffect, useRef, useState } from 'react';
import type { IConnectionTestResponseData } from './index';
import styles from './index.less';

interface IProps {
  isEdit: boolean;
  isCopy: boolean;
  sysAccountExist: boolean;
  forceSys: boolean;
  formRef: React.RefObject<FormInstance>;
  handleChangeFormData: (values: Record<string, any>) => void;
  handleConnectionTest: (
    nameKey: string,
    passwordKey: string,
    accountType: AccountType,
  ) => Promise<IConnectionTestResponseData>;
}

export default (props: IProps) => {
  const {
    formRef,
    isEdit,
    isCopy,
    sysAccountExist,
    forceSys,
    handleChangeFormData,
    handleConnectionTest,
  } = props;
  const [sysPasswordIsEditing, setSysPasswordIsEditing] = useState(false);
  const [validatingSysTest, setvalidatingSysTest] = useState(false);
  const [status, setStatus] = useState(null);
  const sysInput = useRef<InputRef>();
  const isSysPwdCopyMode = isEdit || isCopy;
  const sysPasswordEditable = isSysPwdCopyMode && sysAccountExist ? sysPasswordIsEditing : true;

  useEffect(() => {
    if (forceSys) {
      setTimeout(() => {
        sysInput.current?.focus?.();
      }, 300);
    }
  }, [forceSys, sysInput]);

  useEffect(() => {
    formRef.current.setFieldsValue({
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
                      validateStatus={status}
                      label={formatMessage({
                        id: 'odc.AddConnectionDrawer.AddConnectionForm.Account',
                      })}
                      name="sysTenantUsername"
                      rules={[
                        {
                          validator: validTrimEmptyWithErrorWhenNeed(
                            formatMessage({
                              id: 'app.common.valid.notnull',
                            }),

                            () => {
                              return validatingSysTest;
                            },
                          ),
                        },
                      ]}
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
                      validateStatus={status}
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
                  onClick={async () => {
                    setvalidatingSysTest(true);
                    const res = await handleConnectionTest(
                      'sysTenantUsername',
                      'sysTenantPassword',
                      AccountType.SYS_READ,
                    );

                    let status = null;
                    if (res?.active) {
                      status = 'success';
                    } else {
                      if (
                        [
                          IConnectionTestErrorType.OB_MYSQL_ACCESS_DENIED,
                          IConnectionTestErrorType.OB_ACCESS_DENIED,
                        ].includes(res?.errorCode)
                      ) {
                        status = 'error';
                      }
                      message.error(res?.errorMessage || 'Test Error');
                    }
                    setStatus(status);
                    setvalidatingSysTest(false);
                  }}
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

                        handleChangeFormData({
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
                        handleChangeFormData({
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
