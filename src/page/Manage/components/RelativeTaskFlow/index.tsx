import { getTaskFlowList } from '@/common/network/manager';
import DisplayTable from '@/component/DisplayTable';
import HelpDoc from '@/component/helpDoc';
import { IManagerResourceType, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Descriptions } from 'antd';
import React, { useEffect, useState } from 'react';

const getColumns = () => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.RelativeTaskFlow.TaskFlowName',
      }), //任务流程名称
      ellipsis: true,
    },

    {
      dataIndex: 'enabled',
      title: formatMessage({
        id: 'odc.components.RelativeTaskFlow.ProcessStatus',
      }), //流程状态
      ellipsis: true,
      render: (enabled) =>
        enabled
          ? formatMessage({ id: 'odc.components.RelativeTaskFlow.Enable' }) //启用
          : formatMessage({ id: 'odc.components.RelativeTaskFlow.Disable' }), //停用
    },
    {
      dataIndex: 'match',
      title: (
        <HelpDoc leftText isTip doc="taskFlowIsMatch">
          {
            formatMessage({
              id: 'odc.components.RelativeTaskFlow.MatchOrNot',
            }) /*是否匹配*/
          }
        </HelpDoc>
      ),

      ellipsis: true,
      render: (match) =>
        match
          ? formatMessage({ id: 'odc.components.RelativeTaskFlow.Matched' }) //已匹配
          : '-',
    },
  ];
};

interface ITaskCell {
  name: string;
  enabled: boolean;
  match: boolean;
}

const RelativeTaskFlow: React.FC<{
  resourceId: number;
  resourceType: IManagerResourceType;
}> = ({ resourceId, resourceType }) => {
  const [taskFlows, setTaskFlows] = useState<Record<TaskType, ITaskCell[]>>(null);

  useEffect(() => {
    (async () => {
      const data = {};
      const res = await getTaskFlowList({
        resourceId,
        resourceType,
      });

      res?.contents?.forEach(({ name, enabled, taskType }) => {
        const match = enabled && !data[taskType]?.some((i) => i.enabled) ? true : false;
        const item = {
          name,
          enabled,
          match,
        };

        if (data[taskType]) {
          data[taskType].push(item);
        } else {
          data[taskType] = [item];
        }
      });
      setTaskFlows(data as Record<TaskType, ITaskCell[]>);
    })();
  }, [resourceId, resourceType]);

  const columns = getColumns();

  return (
    <Descriptions column={1} layout="vertical">
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RelativeTaskFlow.Import',
        })} /*导入*/
      >
        <DisplayTable
          rowKey="id"
          columns={columns}
          dataSource={taskFlows?.IMPORT}
          scroll={null}
          disablePagination={true}
        />
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RelativeTaskFlow.Export',
        })} /*导出*/
      >
        <DisplayTable
          rowKey="id"
          columns={columns}
          dataSource={taskFlows?.EXPORT}
          scroll={null}
          disablePagination={true}
        />
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RelativeTaskFlow.AnalogData',
        })} /*模拟数据*/
      >
        <DisplayTable
          rowKey="id"
          columns={columns}
          dataSource={taskFlows?.MOCKDATA}
          scroll={null}
          disablePagination={true}
        />
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RelativeTaskFlow.DatabaseChanges',
        })} /*数据库变更*/
      >
        <DisplayTable
          rowKey="id"
          columns={columns}
          dataSource={taskFlows?.ASYNC}
          scroll={null}
          disablePagination={true}
        />
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RelativeTaskFlow.PermissionApplication',
        })} /*权限申请*/
      >
        <DisplayTable
          rowKey="id"
          columns={columns}
          dataSource={taskFlows?.PERMISSION_APPLY}
          scroll={null}
          disablePagination={true}
        />
      </Descriptions.Item>
    </Descriptions>
  );
};

export default RelativeTaskFlow;
