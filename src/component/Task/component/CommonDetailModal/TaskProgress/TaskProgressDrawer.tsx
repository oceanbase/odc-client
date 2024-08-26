import { SQLContent } from '@/component/SQLContent';
import { TaskDetail, TaskRecordParameters } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Drawer, Space } from 'antd';
import React from 'react';
import { SimpleTextItem } from '../../SimpleTextItem';
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
