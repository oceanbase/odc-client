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

import { TaskType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { Form } from 'antd';
import React from 'react';
import SessionSelect from '@/page/Workspace/components/SessionContextWrap/SessionSelect/SelectItem';
interface IProps {
  type: TaskType;
  label?: string;
  disabled?: boolean;
  name?: string;
  projectId?: number;
  extra?: string;
  width?: string;
  onChange?: (v: number) => void;
}
const DatabaseSelect: React.FC<IProps> = (props) => {
  const {
    type,
    label = formatMessage({
      id: 'odc.component.DatabaseSelect.Database',
    }),
    //数据库
    name = 'databaseId',
    projectId,
    onChange,
  } = props;
  const fetchType = type === TaskType.ONLINE_SCHEMA_CHANGE ? type : null;

  // const databaseOptions = databases
  //   ?.filter((item) =>
  //     getDataSourceModeConfig(item.dataSource?.type)?.features?.task?.includes(type),
  //   )
  //   ?.map(({ name, id, environment, dataSource, project }) => ({
  //     label: (
  //       <Popover
  //         overlayClassName={styles.popover}
  //         data-label={name}
  //         placement="right"
  //         showArrow={false}
  //         content={
  //           <Space direction="vertical">
  //             <Space>
  //               <RiskLevelLabel color={environment?.style} content={environment?.name} />
  //               <Text strong>{name}</Text>
  //             </Space>
  //             <Text type="secondary">
  //               {
  //                 formatMessage({
  //                   id: 'odc.src.component.Task.component.DatabaseSelect.DataSource',
  //                 }) /* 所属数据源:  */
  //               }
  //               {dataSource?.name ?? '-'}
  //             </Text>
  //             <Text type="secondary">
  //               {
  //                 formatMessage({
  //                   id: 'odc.src.component.Task.component.DatabaseSelect.ItSNotPlayed',
  //                 }) /* 所属项目:  */
  //               }
  //               {project?.name ?? '-'}
  //             </Text>
  //           </Space>
  //         }
  //       >
  //         <Space
  //           size={2}
  //           data-label={name}
  //           style={{
  //             display: 'flex',
  //           }}
  //         >
  //           <RiskLevelLabel color={environment?.style} content={environment?.name} />
  //           <span>{name}</span>
  //         </Space>
  //       </Popover>
  //     ),
  //     value: id,
  //   }));

  return (
    <Form.Item
      label={label}
      name={name}
      required
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'odc.component.DatabaseSelect.SelectADatabase',
          }), //请选择数据库
        },
      ]}
    >
      <SessionSelect
        projectId={projectId}
        taskType={type}
        fetchType={fetchType}
        onChange={onChange}
      />
    </Form.Item>
  );
};
export default DatabaseSelect;
