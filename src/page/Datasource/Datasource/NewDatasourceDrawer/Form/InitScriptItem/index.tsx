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

import CommonIDE from '@/component/CommonIDE';
import { Form, Popover, Typography, Space, message } from 'antd';
import React, { useContext } from 'react';
import FormItemPanel from '@/component/FormItemPanel';
import styles from './index.less';
import DatasourceFormContext from '../context';
import { formatMessage } from '@/util/intl';
import CommonCopyIcon from '@/component/CommonCopyIcon';

interface IProps {
  value?: string;
  onChange?: (v: string) => void;
}

const tooltipText = '复制全部 SQL';

const onCopy = (_, result: boolean) => {
  if (result) {
    message.success(
      formatMessage({
        id: 'odc.component.Log.CopiedSuccessfully',
        defaultMessage: '复制成功',
      }), //复制成功
    );
  } else {
    message.error(
      formatMessage({
        id: 'odc.component.Log.ReplicationFailed',
        defaultMessage: '复制失败',
      }), //复制失败
    );
  }
};

const consistencyList = [`Set SESSION ob_read_consistency='WEAK';`];
const formatList = [
  `SET SESSION nls_date_format='YYYY-MM-DD';`,
  `SET SESSION nls_timestamp_format='YYYY-MM-DD HH:MI:SS.XFF3';`,
  `SET SESSION nls_timestamp_tz_format='YYYY-MM-DD HH24:MI:SS.XFF3 TZH:TZM';`,
];
const timeoutList = ['SET SESSION ob_query_timeout = 20000000;'];

const content = () => {
  return (
    <Space direction="vertical">
      <div>
        <Typography.Title level={5}>1、备库弱读</Typography.Title>
        <FormItemPanel
          label={'设置数据库读一致性级别，默认备库应启用弱读'}
          keepExpand
          customExtra={
            <CommonCopyIcon
              text={consistencyList?.join('\n')}
              tooltipText={tooltipText}
              onCopy={onCopy}
            />
          }
        >
          <Space direction="vertical">
            {consistencyList.map((i) => (
              <Typography.Text type="secondary">{i}</Typography.Text>
            ))}
          </Space>
        </FormItemPanel>
      </div>
      <div>
        <Typography.Title level={5}>2、日期字段显示格式</Typography.Title>
        <FormItemPanel
          label={
            '该组变量仅适用于 OceanBase 数据库 Oracle 模式，用于控制日期类型转化为特定的字符串格式。'
          }
          keepExpand
          customExtra={
            <CommonCopyIcon
              text={formatList?.join('\n')}
              tooltipText={tooltipText}
              onCopy={onCopy}
            />
          }
        >
          <Space direction="vertical">
            {formatList.map((i) => (
              <Typography.Text type="secondary">{i}</Typography.Text>
            ))}
          </Space>
        </FormItemPanel>
      </div>
      <div>
        <Typography.Title level={5}>3、SQL 超时</Typography.Title>
        <FormItemPanel
          label={'设置 SQL 最大执行时间，单位为微秒。'}
          keepExpand
          customExtra={
            <CommonCopyIcon
              text={formatList?.join('\n')}
              tooltipText={tooltipText}
              onCopy={onCopy}
            />
          }
        >
          <Space direction="vertical">
            {timeoutList.map((i) => (
              <Typography.Text type="secondary">{i}</Typography.Text>
            ))}
          </Space>
        </FormItemPanel>
      </div>
    </Space>
  );
};

const InitScriptItem: React.FC<{}> = function () {
  return (
    <Popover placement="leftTop" title={''} content={content}>
      <Form.Item
        className={styles.sqlContent}
        style={{ height: 370, marginTop: 12 }}
        name={'sessionInitScript'}
        label=""
      >
        <Editor />
      </Form.Item>
    </Popover>
  );
};

function Editor({ value, onChange }: IProps) {
  const context = useContext(DatasourceFormContext);
  return (
    <CommonIDE
      bordered
      editorProps={{
        value,
        theme: context.disableTheme ? 'obwhite' : null,
      }}
      initialSQL={value}
      language={'sql'}
      onSQLChange={(sql) => {
        onChange(sql);
      }}
    />
  );
}

export default InitScriptItem;
