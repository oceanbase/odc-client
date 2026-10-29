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

import { SQLContent } from '@/component/SQLContent';
import { TaskDetail, TaskRecordParameters } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Drawer, Space } from 'antd';
import React from 'react';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';

const TaskProgressDrawer: React.FC<{
  drawerOpen: boolean;
  task: TaskDetail<TaskRecordParameters>;
  theme: string;
  resultJson: any;
  handleClose: () => void;
}> = ({ drawerOpen, task, theme, resultJson, handleClose }) => {
  return (
    <Drawer
      width={560}
      title={resultJson?.originTableName}
      placement="right"
      onClose={handleClose}
      open={drawerOpen}
    >
      <Space
        direction="vertical"
        style={{
          display: 'flex',
        }}
      >
        <SimpleTextItem
          label={formatMessage({
            id: 'odc.component.CommonDetailModal.TaskProgress.NewTableDdl',
          })}
          /*新表 DDL*/ content={
            <div
              style={{
                marginTop: '8px',
              }}
            >
              <SQLContent
                theme={theme}
                sqlContent={resultJson?.newTableDdl}
                sqlObjectIds={null}
                sqlObjectNames={null}
                taskId={task?.id}
                language={
                  getDataSourceModeConfigByConnectionMode(resultJson?.dialectType)?.sql?.language
                }
              />
            </div>
          }
          direction="column"
        />

        <SimpleTextItem
          label={formatMessage({
            id: 'odc.component.CommonDetailModal.TaskProgress.SourceTableDdl',
          })}
          /*源表 DDL*/ content={
            <div
              style={{
                marginTop: '8px',
              }}
            >
              <SQLContent
                theme={theme}
                sqlContent={resultJson?.originTableDdl}
                sqlObjectIds={null}
                sqlObjectNames={null}
                taskId={task?.id}
                language={
                  getDataSourceModeConfigByConnectionMode(resultJson?.dialectType)?.sql?.language
                }
              />
            </div>
          }
          direction="column"
        />
      </Space>
    </Drawer>
  );
};

export default TaskProgressDrawer;
