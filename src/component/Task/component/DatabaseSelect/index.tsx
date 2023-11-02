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

import { listDatabases } from '@/common/network/database';
import { TaskType } from '@/d.ts';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { Form, Popover, Select, Space, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import { IDatabase } from '@/d.ts/database';
import { getDataSourceModeConfig } from '@/common/datasource';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { useParams } from '@umijs/max';
import { toInteger } from 'lodash';
interface IProps {
  type: TaskType;
  label?: string;
  name?: string;
  projectId?: number;
  extra?: string;
  width?: string;
  onChange?: (v: number) => void;
}
const { Text } = Typography;
const DatabaseSelect: React.FC<IProps> = (props) => {
  const {
    type,
    label = formatMessage({
      id: 'odc.component.DatabaseSelect.Database',
    }),
    //数据库
    name = 'databaseId',
    projectId,
    extra = '',
    width = '320px',
    onChange,
  } = props;
  const [database, setDatabase] = useState<IDatabase[]>([]);
  const { datasourceId } = useParams<{ datasourceId: string }>();
  const form = Form.useFormInstance();
  const databaseId = Form.useWatch(name, form);
  const databaseOptions = database
    ?.filter((item) =>
      getDataSourceModeConfig(item.dataSource?.type)?.features?.task?.includes(type),
    )
    ?.map(({ name, id, environment, dataSource, project }) => ({
      label: (
        <Popover
          overlayClassName={styles.popover}
          data-label={name}
          placement="right"
          arrowPointAtCenter={false}
          content={
            <Space direction="vertical">
              <Space>
                <RiskLevelLabel color={environment?.style} content={environment?.name} />
                <Text strong>{name}</Text>
              </Space>
              <Text type="secondary">
                {
                  formatMessage({
                    id: 'odc.src.component.Task.component.DatabaseSelect.DataSource',
                  }) /* 所属数据源:  */
                }
                {dataSource?.name ?? '-'}
              </Text>
              <Text type="secondary">
                {
                  formatMessage({
                    id: 'odc.src.component.Task.component.DatabaseSelect.ItSNotPlayed',
                  }) /* 所属项目:  */
                }
                {project?.name ?? '-'}
              </Text>
            </Space>
          }
        >
          <Space
            size={2}
            data-label={name}
            style={{
              display: 'flex',
            }}
          >
            <RiskLevelLabel color={environment?.style} content={environment?.name} />
            <span>{name}</span>
          </Space>
        </Popover>
      ),
      value: id,
    }));
  const loadDatabase = async (projectId: number, datasourceId: number) => {
    const res = await listDatabases(
      projectId,
      datasourceId,
      null,
      null,
      null,
      null,
      !!login.isPrivateSpace(),
      true,
    );
    setDatabase(res?.contents);
  };
  const handleDatabaseChange = (value) => {
    onChange?.(value);
  };
  const project = useMemo(() => {
    return database?.find((item) => item.id === databaseId)?.project;
  }, [database, databaseId]);
  useEffect(() => {
    loadDatabase(projectId, datasourceId ? toInteger(datasourceId) : null);
  }, []);
  return (
    <Form.Item
      label={label}
      name={name}
      required
      extra={
        <Space direction="vertical" size={2}>
          {
            !login.isPrivateSpace() &&
              !!project &&
              formatMessage(
                {
                  id: 'odc.component.DatabaseSelect.CurrentProjectProjectname',
                },
                {
                  projectName: project.name,
                },
              ) //`当前项目: ${project.name}`
          }
          {extra && <span>{extra}</span>}
        </Space>
      }
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'odc.component.DatabaseSelect.SelectADatabase',
          }), //请选择数据库
        },
      ]}
    >
      <Select
        showSearch
        filterOption={(input, option) =>
          (option?.label?.props?.['data-label'] ?? '').toLowerCase().includes(input.toLowerCase())
        }
        placeholder={formatMessage({
          id: 'odc.component.DatabaseSelect.PleaseSelect',
        })}
        /*请选择*/ style={
          width
            ? {
                width,
              }
            : null
        }
        options={databaseOptions}
        onChange={handleDatabaseChange}
      />
    </Form.Item>
  );
};
export default DatabaseSelect;
