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
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Collapse, Select, Space, Typography } from 'antd';
import classnames from 'classnames';
import { merge } from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  cronErrorMessage,
  dateOptions,
  dayOptions,
  defaultQuickValueMap,
  fields,
  hourOptions,
  initCronString,
  modeOptions,
  weekOptions,
} from './const';
import styles from './index.less';
import CronInput from './input';
import { CrontabDateType, CrontabMode, ICrontab } from './interface';
import translator, { getCronExecuteCycleByObject, getCronPlan, getCronString } from './utils';

const { Panel } = Collapse;

const defaultCronTabValue = {
  mode: CrontabMode.default,
  dateType: CrontabDateType.daily,
  dayOfMonth: [],
  dayOfWeek: [],
  hour: [0],
  cronString: initCronString,
  error: null,
};

interface IProps {
  initialValue: ICrontab;
  onValueChange: (value: ICrontab) => void;
}

const Crontab = (props, ref) => {
  const { initialValue, onValueChange } = props;
  const [value, setValue] = useState(() => {
    return merge(defaultCronTabValue, initialValue);
  });
  const [plan, setPlan] = useState([]);

  useImperativeHandle(ref, () => ({
    setValue: (values) => {
      setValue(values);
    },
    resetFields: () => {
      setValue(defaultCronTabValue);
    },
  }));

  const [executeCycle, setExecuteCycle] = useState(null);
  const { mode, dateType, dayOfMonth, dayOfWeek, hour, cronString, error } = value;
  const handleValueChange = (newValue) => {
    const values = {
      ...value,
      ...newValue,
      error: newValue.error,
    };

    if (values.mode !== CrontabMode.custom) {
      const cronString = getCronString(values);
      const cron = cronString?.split(' ');
      if (cron.length < 6) {
        // fixed: 经过cron-parser的fieldsToExpression所生成的cronString会丢失second位
        cron.unshift('0');
      }
      values.cronString = cron?.join(' ');
    }
    setValue(values);
  };

  useEffect(() => {
    if (cronString) {
      let plan = [];
      try {
        plan = !error ? getCronPlan(cronString) : [];
      } catch (error) {
        setValue({
          ...value,
          error: {
            plan: cronErrorMessage,
          },
        });
      }
      setPlan(plan);
    }
  }, [cronString, error]);

  useEffect(() => {
    const { mode, cronString, dateType } = value;
    let cycleValue = '';
    if (!value.error) {
      cycleValue =
        mode === CrontabMode.default
          ? getCronExecuteCycleByObject(dateType, value)
          : translator.parse(cronString).toLocaleString();
    }
    setExecuteCycle(cycleValue);
    onValueChange(value);
  }, [value]);

  const handleDateTypeChange = (value: string) => {
    handleValueChange({
      dateType: value,
    });
  };

  const handleModeChange = (value: string) => {
    handleValueChange({
      mode: value,
      dateType: value === CrontabMode.default ? CrontabDateType.daily : dateType,
      cronString: initCronString,
    });
  };

  const handleQuickDate = (type: string) => {
    const quickValue = defaultQuickValueMap[mode][type];
    handleValueChange(quickValue);
  };

  return (
    <div className={styles['crontab-editor']}>
      <div className={styles.header}>
        <span>
          {
            formatMessage({
              id: 'odc.component.Crontab.TimingPeriod',
            }) /*定时周期*/
          }
        </span>
        <Space>
          <Space split="|" size={0}>
            <Button
              type="link"
              onClick={() => {
                handleQuickDate('Hourly');
              }}
            >
              {formatMessage({ id: 'odc.component.Crontab.Hourly' }) /*每小时*/}
            </Button>
            <Button
              type="link"
              onClick={() => {
                handleQuickDate('Nightly');
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.Crontab.EveryNight',
                }) /*每天晚上*/
              }
            </Button>
            <Button
              type="link"
              onClick={() => {
                handleQuickDate('Fridays');
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.Crontab.EveryFriday',
                }) /*每周五*/
              }
            </Button>
          </Space>
          <Select
            value={mode}
            style={{ width: 120 }}
            options={modeOptions}
            onChange={handleModeChange}
          />
        </Space>
      </div>
      <Space
        className={classnames(styles.content, {
          [styles['default-mode']]: mode !== CrontabMode.custom,
        })}
        direction={mode === CrontabMode.custom ? 'vertical' : 'horizontal'}
      >
        {mode === CrontabMode.custom ? (
          <>
            <div className={styles['custom-editor']}>
              {fields.map((name, index) => {
                return (
                  <CronInput
                    key={index}
                    name={name}
                    cronString={cronString}
                    error={error?.[name]}
                    onChange={handleValueChange}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <>
            <Select
              value={dateType}
              style={{ width: 120 }}
              options={dateOptions}
              onChange={handleDateTypeChange}
            />

            {dateType === CrontabDateType.weekly && (
              <Select
                mode="multiple"
                maxTagCount={2}
                value={dayOfWeek}
                style={{ width: 210 }}
                options={weekOptions}
                onChange={(value) => {
                  handleValueChange({
                    dayOfWeek: value,
                    dayOfMonth: [],
                  });
                }}
              />
            )}

            {dateType === CrontabDateType.monthly && (
              <Select
                mode="multiple"
                maxTagCount={3}
                value={dayOfMonth}
                style={{ width: 210 }}
                options={dayOptions}
                onChange={(value) => {
                  handleValueChange({
                    dayOfWeek: [],
                    dayOfMonth: value,
                  });
                }}
              />
            )}

            <Select
              mode="multiple"
              maxTagCount={3}
              value={hour}
              style={{ width: 310 }}
              options={hourOptions}
              onChange={(value) => {
                handleValueChange({
                  hour: value,
                  dayOfMonth: [],
                });
              }}
            />
          </>
        )}
      </Space>
      <Collapse
        bordered={false}
        expandIconPosition="right"
        expandIcon={({ isActive }) => {
          if (error) return null;
          return isActive ? <UpOutlined /> : <DownOutlined />;
        }}
      >
        <Panel
          header={
            <Typography.Text ellipsis style={{ width: '360px' }}>
              {error ? Object.values(error)?.join(', ') : executeCycle}
            </Typography.Text>
          }
          key="1"
          extra={
            !error ? (
              <Space>
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.Crontab.NextExecutionTime',
                    }) /*下一次执行时间：*/
                  }
                </span>
                <span>{plan[0]}</span>
              </Space>
            ) : null
          }
        >
          {plan?.slice(1)?.map((item, index) => {
            return <div key={index}>{item}</div>;
          })}
        </Panel>
      </Collapse>
    </div>
  );
};

export default forwardRef<any, IProps>(Crontab);

export { translator, getCronExecuteCycleByObject };
