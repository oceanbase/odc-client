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

import { SPACE_REGEX } from '@/constant';
import { changeLockPwd, haveLockPwd } from '@/util/business/client';
import { formatMessage } from '@/util/intl';
import { Button, Form, Input, message, Modal, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useCallback, useEffect, useState } from 'react';

interface IProps {
  visible: boolean;
  onCloseModal: () => void;
}

const ChangeLockPwd: React.FC<IProps> = function (props: IProps) {
  const [form] = useForm();
  const [isHaveLockPwd, setIsHaveLockPwd] = useState(false);
  const closeModal = useCallback(() => {
    props.onCloseModal();
    form.resetFields();
  }, []);

  async function updateHaveLockPwd() {
    setIsHaveLockPwd(await haveLockPwd());
  }

  useEffect(() => {
    if (props.visible) {
      updateHaveLockPwd();
    }
  }, [props.visible]);

  return (
    <>
      <Modal
        title={formatMessage({
          id: 'odc.component.LoginMenus.ChangeLockPwd.SetTheApplicationPassword',
          defaultMessage: '设置应用密码',
        })}
        /* 设置应用密码 */
        open={props.visible}
        onCancel={closeModal}
        footer={
          <Space>
            {isHaveLockPwd && (
              <Button
                onClick={async () => {
                  const values = await form.validateFields(['originPassword']);
                  try {
                    // @ts-ignore
                    const isSuccess = await changeLockPwd(values.originPassword, '');
                    if (isSuccess) {
                      message.success(
                        formatMessage({
                          id: 'odc.component.LoginMenus.ChangeLockPwd.Deleted',
                          defaultMessage: '删除成功！',
                        }),

                        // 删除成功！
                      );
                      closeModal();
                    } else {
                      message.error(
                        formatMessage({
                          id: 'odc.component.LoginMenus.ChangeLockPwdModal.UnableToDeleteCheckWhether',
                          defaultMessage: '删除失败，请确认密码是否正确',
                        }),
                        // 删除失败，请确认密码是否正确
                      );
                    }
                  } catch (e) {
                    console.error(e);
                    message.error(
                      formatMessage({
                        id: 'odc.component.LoginMenus.ChangeLockPwd.SystemException',
                        defaultMessage: '系统异常',
                      }),

                      // 系统异常
                    );
                  }
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.LoginMenus.ChangeLockPwd.DeletePassword',
                    defaultMessage: '删除密码',
                  })

                  /* 删除密码 */
                }
              </Button>
            )}

            <Button
              type="primary"
              onClick={async () => {
                const values = await form.validateFields();
                if (values.password !== values.confirmPassword) {
                  message.warning(
                    formatMessage({
                      id: 'odc.component.LoginMenus.ChangeLockPwdModal.TheTwoPasswordsAreInconsistent',
                      defaultMessage: '两次密码输入不一致!',
                    }),
                    // 两次密码输入不一致!
                  );
                  return;
                }
                try {
                  const processLockKey = await changeLockPwd(
                    values.originPassword,
                    values.password,
                  );

                  if (processLockKey) {
                    message.success(
                      formatMessage({
                        id: 'odc.component.LoginMenus.ChangeLockPwd.Modified',
                        defaultMessage: '修改成功！',
                      }),

                      // 修改成功！
                    );
                    closeModal();
                    localStorage.setItem('lockKey', processLockKey);
                  } else {
                    message.error(
                      formatMessage({
                        id: 'odc.component.LoginMenus.ChangeLockPwdModal.UnableToModifyThePassword',
                        defaultMessage: '修改失败，请确认密码是否正确',
                      }),
                      // 修改失败，请确认密码是否正确
                    );
                  }
                } catch (e) {
                  console.error(e);
                  message.error(
                    formatMessage({
                      id: 'odc.component.LoginMenus.ChangeLockPwd.SystemException',
                      defaultMessage: '系统异常',
                    }),

                    // 系统异常
                  );
                }
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.LoginMenus.ChangeLockPwd.ChangePassword',
                  defaultMessage: '修改密码',
                })

                /* 修改密码 */
              }
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          {isHaveLockPwd && (
            <Form.Item
              label={
                formatMessage({
                  id: 'odc.component.LoginMenus.ChangeLockPwdModal.OriginalPassword',
                  defaultMessage: '原密码',
                })
                // 原密码
              }
              /* 密码 */ name="originPassword"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.component.LoginMenus.ChangeLockPwdModal.EnterTheOriginalPassword',
                    defaultMessage: '请输入原密码',
                  }),
                  // 请输入原密码
                  // 请输入密码
                },
              ]}
            >
              <Input.Password
                placeholder={
                  formatMessage({
                    id: 'odc.component.LoginMenus.ChangeLockPwdModal.EnterTheOriginalPassword',
                    defaultMessage: '请输入原密码',
                  })
                  // 请输入原密码
                } /* 请输入新密码 */
              />
            </Form.Item>
          )}

          <Form.Item
            label={formatMessage({
              id: 'odc.component.LoginMenus.ChangeLockPwd.Password',
              defaultMessage: '密码',
            })}
            /* 密码 */
            name="password"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.LoginMenus.ChangeLockPwd.EnterAPassword',
                  defaultMessage: '请输入密码',
                }),

                // 请输入密码
              },
              {
                pattern: SPACE_REGEX,
                message: formatMessage({
                  id: 'odc.component.LoginMenus.ChangeLockPwdModal.ThePasswordCannotContainSpaces',
                  defaultMessage: '密码不能包含空格',
                }), //密码不能包含空格
              },
            ]}
          >
            <Input.Password
              placeholder={formatMessage({
                id: 'odc.component.LoginMenus.ChangeLockPwd.EnterANewPassword',
                defaultMessage: '请输入新密码',
              })}

              /* 请输入新密码 */
            />
          </Form.Item>
          <Form.Item
            label={
              formatMessage({
                id: 'odc.component.LoginMenus.ChangeLockPwdModal.ConfirmPassword',
                defaultMessage: '确认密码',
              })
              // 确认密码
            }
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.LoginMenus.ChangeLockPwdModal.EnterThePasswordAgain',
                  defaultMessage: '请再次输入密码',
                }),
                // 请再次输入密码
                // 请输入密码
              },
            ]}
          >
            <Input.Password
              placeholder={
                formatMessage({
                  id: 'odc.component.LoginMenus.ChangeLockPwdModal.EnterANewPasswordAgain',
                  defaultMessage: '请再次输入新密码',
                })
                // 请再次输入新密码
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default ChangeLockPwd;
