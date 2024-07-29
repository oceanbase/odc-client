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

import { formatMessage } from '@/util/intl';
import { Alert, Button, Form, Input } from 'antd';
import type { FormProps, RuleObject } from 'antd/lib/form';
import { isFunction, toString } from 'lodash';
import React, { useCallback } from 'react';
import type { LoginLocale } from './index';
import { getPrefix } from './index';
import './index.less';

/**
 * 冗余的转义符可以增强正则的可读性
 */
// eslint-disable-next-line
export const PASSWORD_REGEX =
  /^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*\d){2,})(?=(.*[ !"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`\{\|\}~]){2,})[A-Za-z\d !"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`\{\|\}~]{8,32}$/;

export interface IRegisterFormProps extends FormProps {
  locale?: LoginLocale;
  /**
   * 用户自定义密码规则
   */
  passwordRule?: {
    pattern: RegExp;
    message: string;
  };
  loading?: boolean;
  isUserExists?: (account: string) => Promise<boolean>;
  errorMessage?: React.ReactNode | string;
}

const Register: React.FC<IRegisterFormProps> = ({
  isUserExists,
  locale,
  loading,
  passwordRule,
  errorMessage,
  ...restProps
}) => {
  const [formRef] = Form.useForm();
  const prefix = getPrefix('login');

  const handleValidateAccount = useCallback(
    async (rule: RuleObject, value: string) => {
      if (!value || !isFunction(isUserExists)) {
        return;
      }
      const isExists = await isUserExists(value);
      if (isExists) {
        throw new Error(
          formatMessage({
            id: 'odc.component.Login.RegisterForm.TheUsernameAlreadyExists',
            defaultMessage: '用户名已存在',
          }),
        ); //用户名已存在
      }
    },
    [isUserExists],
  );

  const handleValidateConfirmPassword = useCallback(
    (rule, value, callback) => {
      if (!formRef) {
        callback();
        return;
      }
      const pwd = formRef.getFieldValue('password');
      if (toString(value) !== toString(pwd)) {
        callback(
          formatMessage({
            id: 'odc.component.Login.RegisterForm.ConfirmPasswordInconsistency',
            defaultMessage: '确认密码不一致',
          }), //确认密码不一致
        );
        return;
      }
      callback();
    },
    [formRef],
  );

  const passwordRegexpRule = passwordRule || {
    pattern: PASSWORD_REGEX,
    message: formatMessage({
      id: 'odc.component.Login.RegisterForm.ContainsAtLeastDigitsUppercase',
      defaultMessage:
        '至少包含 2 个数字、2 个大写字母、2 个小写字母和 2 个特殊字符 (._+@#$%)，长度为 8~32 个字符',
    }), //至少包含 2 位数字、2 位大写字母、2 位小写字母和 2 位特殊字符 (._+@#$%)，长度 8~32 位字符
  };

  return (
    <Form
      layout="vertical"
      requiredMark={false}
      form={formRef}
      {...restProps}
      data-testid="login.register"
    >
      <Form.Item
        name="username"
        label={formatMessage({
          id: 'odc.component.Login.RegisterForm.Username',
          defaultMessage: '用户名',
        })} /*用户名*/
        extra={formatMessage({
          id: 'odc.component.Login.RegisterForm.SupportsEnglishNumbersUnderscoresAnd',
          defaultMessage: '支持英文、数字、下划线和特殊字符 (._+@#$%)，长度为 4~48 个字符',
        })} /*支持英文、数字、下划线和特殊字符 (._+@#$%)，长度 4~48 位字符*/
        validateFirst
        rules={[
          {
            required: true,
            whitespace: true,
            message: formatMessage({
              id: 'odc.component.Login.RegisterForm.TheUsernameCannotBeEmpty',
              defaultMessage: '用户名不能为空',
            }), //用户名不能为空
          },
          {
            min: 4,
            max: 48,
            message: formatMessage({
              id: 'odc.component.Login.RegisterForm.TheUsernameMustBeTo',
              defaultMessage: '用户名长度为 4~48 个字符',
            }), //用户名长度 4~48 位字符
          },
          {
            pattern: /^[a-zA-Z0-9_.+@#$%]+$/,
            message: formatMessage({
              id: 'odc.component.Login.RegisterForm.TheUserNameFormatDoes',
              defaultMessage: '用户名格式不符合要求',
            }), //用户名格式不符合要求
          },
          {
            validator: handleValidateAccount,
          },
        ]}
      >
        <Input autoComplete="new-account" autoFocus />
      </Form.Item>
      <Form.Item
        name="password"
        label={formatMessage({
          id: 'odc.component.Login.RegisterForm.Password',
          defaultMessage: '密码',
        })} /*密码*/
        dependencies={['confirmPassword']}
        help={passwordRegexpRule.message}
        validateFirst
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.Login.RegisterForm.ThePasswordCannotBeEmpty',
              defaultMessage: '密码不能为空',
            }), //密码不能为空
          },
          passwordRegexpRule,
        ]}
      >
        <Input.Password visibilityToggle={false} autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label={formatMessage({
          id: 'odc.component.Login.RegisterForm.ConfirmPassword',
          defaultMessage: '确认密码',
        })} /*确认密码*/
        dependencies={['password']}
        validateFirst
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.Login.RegisterForm.PleaseEnterThePasswordAgain',
              defaultMessage: '请再次输入密码',
            }), //请再次输入密码
          },
          {
            validator: handleValidateConfirmPassword,
          },
        ]}
      >
        <Input.Password visibilityToggle={false} autoComplete="new-password" />
      </Form.Item>
      <Button
        // 按下回车键，即可触发点击事件
        htmlType="submit"
        loading={loading}
        type="primary"
        block={true}
        className={`${prefix}-submit-btn`}
      >
        {
          formatMessage({
            id: 'odc.component.Login.RegisterForm.RegisterNow',
            defaultMessage: '立即注册',
          }) /*立即注册*/
        }
      </Button>
      {errorMessage && (
        <Alert type="error" showIcon={true} className={`${prefix}-alert`} message={errorMessage} />
      )}
    </Form>
  );
};

export default Register;
