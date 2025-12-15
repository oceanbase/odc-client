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

import { ColumnStoreType } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import styles from '../index.less';
import MViewContext from '../context/MaterializedViewContext';
import { columnGroupsText, refreshMethodText, refreshScheduleUnitText } from '@/constant/label';
import { RefreshMethod, RefreshScheduleUnit, ConnectType } from '@/d.ts';
import { StartStrategy } from '../interface';
import { useDataSourceConfig } from '../config';
import { CaseInput } from '@/component/Input/Case';
import HelpDoc from '@/component/helpDoc';

interface IProps {
  isEdit?: boolean;
  formRef?: React.Ref<FormInstance<any>>;
}

const CreateMaterializedViewBaseInfoForm: React.FC<IProps> = (props) => {
  const mviewContext = useContext(MViewContext);
  const { setInfo, info, session } = mviewContext;
  const [form] = Form.useForm();
  const [startStrategy, setStartStrategy] = useState<StartStrategy | false>(false);
  const datasourceConfig = useDataSourceConfig(session?.connection?.type);

  const unitOptions = useMemo(() => {
    let options = [
      RefreshScheduleUnit.SECOND,
      RefreshScheduleUnit.MINUTE,
      RefreshScheduleUnit.HOUR,
      RefreshScheduleUnit.DAY,
      RefreshScheduleUnit.WEEK,
      RefreshScheduleUnit.MONTH,
      RefreshScheduleUnit.YEAR,
    ];

    /**
     * obOracle 不支持选择周
     * */
    if (session.odcDatabase.connectType === ConnectType.OB_ORACLE) {
      options = options.filter((item) => item !== RefreshScheduleUnit.WEEK);
    }
    return options;
  }, [session]);

  useEffect(() => {
    form.setFieldsValue(info);
  }, [info]);

  useEffect(() => {
    if (startStrategy === StartStrategy.START_AT) {
      info.refreshSchedule = {
        startStrategy,
        startWith: undefined,
        interval: info.refreshSchedule.interval || 1,
        unit: info.refreshSchedule.unit || RefreshScheduleUnit.MINUTE,
      };
    } else if (startStrategy === StartStrategy.START_NOW) {
      info.refreshSchedule = {
        startStrategy,
        interval: info.refreshSchedule.interval || 1,
        unit: info.refreshSchedule.unit || RefreshScheduleUnit.MINUTE,
      };
    } else if (!startStrategy) {
      info.refreshSchedule = {
        startStrategy,
      };
    }
    setTimeout(() => {
      setInfo(info);
    });
  }, [startStrategy]);

  useEffect(() => {
    if (info.refreshMethod === RefreshMethod.NEVER_REFRESH) {
      info.refreshSchedule = {
        startStrategy: false,
      };
      form.setFieldValue(['refreshSchedule', 'startStrategy'], false);
      setStartStrategy(false);
      setTimeout(() => {
        setInfo(info);
      });
    }
  }, [info.refreshMethod]);

  return (
    <Form
      className={styles.createMaterializedViewBaseInfoForm}
      form={form}
      initialValues={null}
      layout="vertical"
      requiredMark="optional"
      onValuesChange={async () => {
        const values = await form.getFieldsValue();
        setInfo(values);
      }}
    >
      <Form.Item
        name="name"
        label={formatMessage({
          id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.F066FDC2',
          defaultMessage: '物化视图名称',
        })}
        style={{ width: 400 }}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.A9B5F2DD',
              defaultMessage: '请填写名称',
            }),
          },
        ]}
      >
        <CaseInput
          caseSensitive={datasourceConfig?.sql?.caseSensitivity}
          escapes={datasourceConfig?.sql?.escapeChar}
          autoFocus
          placeholder={formatMessage({
            id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.16BC7831',
            defaultMessage: '请输入名称',
          })}
        />
      </Form.Item>
      <Form.Item
        name="columnGroups"
        label={formatMessage({
          id: 'src.page.Workspace.components.CreateTable.BaseInfo.3907128F',
          defaultMessage: '存储模式',
        })}
        required
      >
        <Select
          mode="multiple"
          style={{ width: 200 }}
          options={[
            {
              value: ColumnStoreType.COLUMN,
              label: columnGroupsText[ColumnStoreType.COLUMN],
            },
            {
              value: ColumnStoreType.ROW,
              label: columnGroupsText[ColumnStoreType.ROW],
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="refreshMethod"
        label={formatMessage({
          id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.3E600800',
          defaultMessage: '刷新方式',
        })}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.5E10D5AE',
              defaultMessage: '请选择刷新方式',
            }),
          },
        ]}
        required
      >
        <Select
          style={{ width: 200 }}
          options={[
            RefreshMethod.REFRESH_FAST,
            RefreshMethod.REFRESH_FORCE,
            RefreshMethod.REFRESH_COMPLETE,
            RefreshMethod.NEVER_REFRESH,
          ].map((item) => ({
            label: refreshMethodText[item],
            value: item,
          }))}
        />
      </Form.Item>
      {info.refreshMethod !== RefreshMethod.NEVER_REFRESH && (
        <Form.Item
          name="parallelismDegree"
          label={formatMessage({
            id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.F34539EC',
            defaultMessage: '刷新并行度',
          })}
        >
          <InputNumber min={1} max={Number.MAX_SAFE_INTEGER} style={{ width: 200 }} />
        </Form.Item>
      )}
      <div style={{ display: 'flex' }}>
        <Form.Item
          name={['refreshSchedule', 'startStrategy']}
          label={formatMessage({
            id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.276039AE',
            defaultMessage: '自动刷新',
          })}
          style={{ marginRight: '40px' }}
          required
        >
          <Select
            value={startStrategy}
            style={{ width: 200 }}
            onChange={(e) => {
              setStartStrategy(e);
            }}
            options={[
              {
                label: formatMessage({
                  id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.1AF3CB75',
                  defaultMessage: '立即开启',
                }),
                value: StartStrategy.START_NOW,
                disabled: info.refreshMethod === RefreshMethod.NEVER_REFRESH,
              },
              {
                label: formatMessage({
                  id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.AA4FAFC5',
                  defaultMessage: '指定开启时间',
                }),
                value: StartStrategy.START_AT,
                disabled: info.refreshMethod === RefreshMethod.NEVER_REFRESH,
              },
              {
                label: formatMessage({
                  id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.1240C8BF',
                  defaultMessage: '不开启',
                }),
                value: false,
              },
            ]}
          />
        </Form.Item>
        {startStrategy === StartStrategy.START_AT && (
          <Form.Item
            name={['refreshSchedule', 'startWith']}
            label={
              <>
                {formatMessage({
                  id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.F9A9075D',
                  defaultMessage: '刷新开始时间',
                })}
                <HelpDoc doc="CreateMaterializedViewSelectStartWith" />
              </>
            }
            style={{ marginRight: '40px' }}
            required
          >
            <DatePicker showTime onChange={(e) => {}} />
          </Form.Item>
        )}
        {startStrategy && (
          <>
            <Form.Item
              name={['refreshSchedule', 'interval']}
              label={formatMessage({
                id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.A7E62951',
                defaultMessage: '刷新间隔',
              })}
              initialValue={1}
              style={{
                display: 'inline',
              }}
              required
            >
              <InputNumber min={1} className={styles.interval} />
            </Form.Item>
            <Form.Item
              name={['refreshSchedule', 'unit']}
              initialValue={RefreshScheduleUnit.SECOND}
              style={{
                display: 'flex',
                alignItems: 'end',
              }}
            >
              <Select
                className={styles.unit}
                style={{ width: 60 }}
                options={unitOptions?.map((item) => ({
                  value: item,
                  label: refreshScheduleUnitText[item],
                }))}
              />
            </Form.Item>
          </>
        )}
      </div>
      <Form.Item
        name="enableQueryRewrite"
        label={formatMessage({
          id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.A93F6FF8',
          defaultMessage: '查询改写',
        })}
        required
      >
        <Select
          style={{ width: 200 }}
          options={[
            {
              label: formatMessage({
                id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.6177F5AB',
                defaultMessage: '开启',
              }),
              value: true,
            },
            {
              label: formatMessage({
                id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.EAE65A99',
                defaultMessage: '不开启',
              }),
              value: false,
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="enableQueryComputation"
        label={formatMessage({
          id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.4B279078',
          defaultMessage: '实时',
        })}
        required
      >
        <Select
          style={{ width: 200 }}
          options={[
            {
              label: formatMessage({
                id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.F7C602A7',
                defaultMessage: '是',
              }),
              value: true,
            },
            {
              label: formatMessage({
                id: 'src.page.Workspace.components.CreateMaterializedView.BaseInfo.3DC02FAF',
                defaultMessage: '否',
              }),
              value: false,
            },
          ]}
        />
      </Form.Item>
    </Form>
  );
};

export default CreateMaterializedViewBaseInfoForm;
