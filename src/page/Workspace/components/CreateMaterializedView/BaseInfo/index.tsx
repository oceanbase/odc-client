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

  return (
    <Form
      className={styles.createMaterializedViewBaseInfoForm}
      form={form}
      initialValues={null}
      layout="vertical"
      onValuesChange={async () => {
        const values = await form.getFieldsValue();
        setInfo(values);
      }}
    >
      <Form.Item
        name="name"
        label={'物化视图名称'}
        style={{ width: 400 }}
        rules={[
          {
            required: true,
            message: '请填写名称',
          },
        ]}
      >
        <CaseInput
          caseSensitive={datasourceConfig?.sql?.caseSensitivity}
          escapes={datasourceConfig?.sql?.escapeChar}
          autoFocus
          placeholder={'请输入名称'}
        />
      </Form.Item>
      <Form.Item
        name="columnGroups"
        label={formatMessage({
          id: 'src.page.Workspace.components.CreateTable.BaseInfo.3907128F',
          defaultMessage: '存储模式',
        })}
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
        label="刷新方式"
        rules={[
          {
            required: true,
            message: '请选择刷新方式',
          },
        ]}
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
      <Form.Item name="parallelismDegree" label="刷新并行度">
        <InputNumber min={1} max={Number.MAX_SAFE_INTEGER} style={{ width: 200 }} />
      </Form.Item>
      <div style={{ display: 'flex' }}>
        <Form.Item
          name={['refreshSchedule', 'startStrategy']}
          label="自动刷新"
          style={{ marginRight: '40px' }}
        >
          <Select
            value={startStrategy}
            style={{ width: 200 }}
            onChange={(e) => {
              setStartStrategy(e);
            }}
            options={[
              {
                label: '立即开启',
                value: StartStrategy.START_NOW,
              },
              {
                label: '指定开启时间',
                value: StartStrategy.START_AT,
              },
              {
                label: '不开启',
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
                刷新开始时间 <HelpDoc doc="CreateMaterializedViewSelectStartWith" />
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
              label="刷新间隔"
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
      <Form.Item name="enableQueryRewrite" label="查词改写">
        <Select
          style={{ width: 200 }}
          options={[
            {
              label: '开启',
              value: true,
            },
            {
              label: '不开启',
              value: false,
            },
          ]}
        />
      </Form.Item>
      <Form.Item name="enableQueryComputation" label="实时">
        <Select
          style={{ width: 200 }}
          options={[
            {
              label: '是',
              value: true,
            },
            {
              label: '否',
              value: false,
            },
          ]}
        />
      </Form.Item>
    </Form>
  );
};

export default CreateMaterializedViewBaseInfoForm;
