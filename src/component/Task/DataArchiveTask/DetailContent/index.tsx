import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import type { CycleTaskDetail, TaskOperationType, IDataArchiveJobParameters } from '@/d.ts';
import { TaskExecStrategyMap } from '@/component/Task';
import { isCycleTriggerStrategy } from '@/component/Task/helper';
import { getFormatDateTime } from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Divider, Space } from 'antd';
import React from 'react';
import styles from '../../index.less';
import ArchiveRange from './ArchiveRange';
import VariableConfig from './VariableConfig';

const { Panel } = Collapse;

interface IProps {
  task: CycleTaskDetail<IDataArchiveJobParameters>;
  hasFlow: boolean;
  operationType?: TaskOperationType;
}

const DataArchiveTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow } = props;
  const { triggerConfig, jobParameters } = task ?? {};

  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item span={2} label="任务编号">
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="任务类型">
          数据归档
        </Descriptions.Item>
        <Descriptions.Item span={2} label="源数据库">
          {jobParameters?.sourceDatabaseName || '-'}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="目标数据库">
          {jobParameters?.targetDatabaseName || '-'}
        </Descriptions.Item>
        {hasFlow && <Descriptions.Item label="风险等级">{task?.maxRiskLevel}</Descriptions.Item>}
      </Descriptions>

      <SimpleTextItem
        label="变量配置"
        content={
          <div style={{ margin: '8px 0 12px' }}>
            <VariableConfig variables={jobParameters?.variables} />
          </div>
        }
        direction="column"
      />
      <SimpleTextItem
        label="归档范围"
        content={
          <div style={{ margin: '8px 0 12px' }}>
            <ArchiveRange tables={jobParameters?.tables} />
          </div>
        }
        direction="column"
      />
      <Descriptions column={2}>
        <Descriptions.Item span={2} label="清理源端已归档的数据">
          {jobParameters?.deleteAfterMigration ? '是' : '否'}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions column={2}>

        <Descriptions.Item label="执行方式">
          {TaskExecStrategyMap[triggerConfig.triggerStrategy]}
        </Descriptions.Item>
        { isCycleTriggerStrategy(triggerConfig?.triggerStrategy) && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles['next-time']}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label="下一次执行时间"
                  content={
                    <Space>
                      {getFormatDateTime(task.nextFireTimes?.[0])}
                      {isActive ? <UpOutlined /> : <DownOutlined />}
                    </Space>
                  }
                />
              )}
            >
              <Panel key="1" header={null}>
                <Space direction="vertical" size={0}>
                  {task?.nextFireTimes?.map((item, index) => {
                    return index > 0 && <div>{getFormatDateTime(item)}</div>;
                  })}
                </Space>
              </Panel>
            </Collapse>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="备注" span={2}>
          {task?.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <Descriptions column={2}>
        <Descriptions.Item label="创建人">{task?.creator?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{getFormatDateTime(task.createTime)}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default DataArchiveTaskContent;
