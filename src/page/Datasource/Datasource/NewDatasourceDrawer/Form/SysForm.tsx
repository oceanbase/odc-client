import { testConnection } from '@/common/network/connection';
import FormItemPanel from '@/component/FormItemPanel';
import { AccountType } from '@/d.ts';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Checkbox, Col, Form, Input, InputRef, message, Row, Typography } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { useContext, useEffect, useRef, useState } from 'react';
import DatasourceFormContext from './context';
import styles from './index.less';
import Password from './Password';

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

  useEffect(() => {
    formRef.setFieldsValue({
      useSys: sysAccountExist,
    });
  }, [sysAccountExist]);

  async function testSys() {
    let values;
    try {
      values = await formRef.validateFields([
        'type',
        'host',
        'port',
        'clusterName',
        'tenantName',
        'sysTenantUsername',
        'sysTenantPassword',
      ]);
    } catch (e) {}
    if (!values) {
      return;
    }
    const params = isEdit ? { ...formContext.originDatasource, ...values } : values;
    params.username = params?.sysTenantUsername;
    params.password = params?.sysTenantPassword;
    const res = await testConnection(params, AccountType.SYS_READ, true);
    const error = res?.errMsg || res?.data?.errorMessage;
    !error
      ? message.success(
          formatMessage({ id: 'odc.NewDatasourceDrawer.Form.SysForm.ConnectionSuccessful' }), //连接成功
        )
      : message.error(error);
  }

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
                      label={formatMessage({
                        id: 'odc.AddConnectionDrawer.AddConnectionForm.Password',
                      })}
                      name="sysTenantPassword"
                    >
                      <Password
                        isEditing={!isSysPwdCopyMode || !sysAccountExist || sysPasswordIsEditing}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <a
                  style={{
                    marginRight: 8,
                  }}
                  onClick={async () => testSys()}
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
