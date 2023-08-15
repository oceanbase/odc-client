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

import InputBigNumber from '@/component/InputBigNumber';
import { DragInsertTypeText, SQLSessionModeText } from '@/constant/label';
import { AutoCommitMode, DragInsertType, IUserConfig, SQLSessionMode } from '@/d.ts';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Form, Radio, Select, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

interface IProps {
  initialValues: IUserConfig;
  formRef: React.Ref<FormInstance>;
  settingStore?: SettingStore;
  handleValueChange: () => void;
}

const delimiterOptions = [';', '/', '//', '$', '$$'].map((option) => ({
  label: option,
  value: option,
}));

const ConfigItem = (props: any) => {
  const { title, desc } = props;
  return (
    <Space direction="vertical" size={5}>
      <span className={styles.configTitle}>{title}</span>
      <span className={styles.configDesc}>{desc}</span>
    </Space>
  );
};

const UserConfigForm: React.FC<IProps> = (props) => {
  const { initialValues, handleValueChange, formRef, settingStore } = props;

  return (
    <Form
      layout="vertical"
      ref={formRef}
      initialValues={initialValues}
      onValuesChange={handleValueChange}
      requiredMark={false}
      className={styles.userConfigForm}
    >
      <Form.Item
        name="sqlexecute.defaultDelimiter"
        label={
          <ConfigItem
            title={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.DelimiterSettings',
            })}
            /* 界定符设置 */ desc={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.SetTheDefaultDelimiterIn',
            })}

            /* 设置 SQL 窗口内默认的 delimiter 符号 */
          />
        }
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.SelectADelimiter',
            }),

            // 请选择界定符设置
          },
        ]}
      >
        <Select style={{ width: '160px' }} options={delimiterOptions} />
      </Form.Item>
      <Form.Item
        name="sqlexecute.oracleAutoCommitMode"
        label={
          <ConfigItem
            title={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.OracleTransactionSubmissionMode',
            })}
            /* Oracle事务提交模式 */ desc={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.SetTheDefaultCommitMode',
            })}

            /* 设置 Oracle 模式下事务的默认提交模式 */
          />
        }
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.SelectOracleTransactionCommitMode',
            }),

            // 请选择Oracle事务提交模式
          },
        ]}
      >
        <Radio.Group>
          <Radio value={AutoCommitMode.OFF}>
            {
              formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Manual',
              })

              /* 手动 */
            }
          </Radio>
          <Radio value={AutoCommitMode.ON}>
            {
              formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Automatic',
              })

              /* 自动 */
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="sqlexecute.mysqlAutoCommitMode"
        label={
          <ConfigItem
            title={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.MysqlTransactionCommitMode',
            })}
            /* MySQL事务提交模式 */ desc={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.SetTheDefaultCommitMode.1',
            })}

            /* 设置 MySQL 模式下事务的默认提交模式 */
          />
        }
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.SelectMysqlTransactionCommitMode',
            }),

            // 请选择MySQL事务提交模式
          },
        ]}
      >
        <Radio.Group>
          <Radio value={AutoCommitMode.OFF}>
            {
              formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Manual',
              })

              /* 手动 */
            }
          </Radio>
          <Radio value={AutoCommitMode.ON}>
            {
              formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Automatic',
              })

              /* 自动 */
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="sqlexecute.defaultQueryLimit"
        label={
          <ConfigItem
            title={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.ResultSetQueryNumberLimit',
            })}
            /* 结果集查询条数限制 */
            desc={formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.SetTheDefaultNumberOf',
            })}

            /* 设置 SQL 窗口内执行 SQL 默认返回的结果行数 */
          />
        }
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.LoginMenus.UserConfig.EnterTheNumberOfEntries',
            }),

            // 请输入结果集查询条数
          },
          {
            validator: async (_, value) => {
              let res = Promise.resolve();
              if (value % 1 !== 0) {
                res = Promise.reject(
                  new Error(
                    formatMessage({
                      id: 'odc.component.UserConfigForm.EnterAnInteger',
                    }),
                  ),
                );
              }
              return res;
            },
          },
        ]}
      >
        <InputBigNumber
          style={{
            width: '100px',
          }}
          min="1"
          max="2147483647"
        />
      </Form.Item>
      <Form.Item
        name={'sqlexecute.defaultObjectDraggingOption'}
        label={
          <ConfigItem
            title={
              formatMessage({
                id: 'odc.component.UserConfigForm.ObjectDragAndDropGeneration',
              })
              //对象拖放生成语句类型
            }
            desc={
              formatMessage({
                id: 'odc.component.UserConfigForm.TheDefaultStatementTypeGenerated',
              })
              //设置拖放表/视图对象时默认生成的语句类型
            }
          />
        }
        required
      >
        <Radio.Group>
          <Radio value={DragInsertType.NAME}>{DragInsertTypeText[DragInsertType.NAME]}</Radio>
          <Radio value={DragInsertType.SELECT}>{DragInsertTypeText[DragInsertType.SELECT]}</Radio>
          <Radio value={DragInsertType.INSERT}>{DragInsertTypeText[DragInsertType.INSERT]}</Radio>
          <Radio value={DragInsertType.UPDATE}>{DragInsertTypeText[DragInsertType.UPDATE]}</Radio>
          <Radio value={DragInsertType.DELETE}>{DragInsertTypeText[DragInsertType.DELETE]}</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
};

export default inject('settingStore')(observer(UserConfigForm));
