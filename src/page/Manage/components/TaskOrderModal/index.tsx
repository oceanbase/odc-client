import { getTaskFlowList, updatePriority } from '@/common/network/manager';
import { TaskPageType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  message,
  Radio,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { ITaskFlowConfig } from '../../interface';
import { TaskTypeMap } from '../TaskFlowPage';
import DraggableTable, { DragHandle } from './draggableTable';
import styles from './index.less';

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const columns = [
  {
    title: formatMessage({ id: 'odc.components.TaskOrderModal.Sort' }), //排序
    width: 60,
    dataIndex: 'id',
    key: 'id',
    className: 'drag-visible',
    render: (_, record) => {
      return (
        <div className={record.builtIn ? styles.disabled : styles['drag-handle']}>
          <DragHandle />
        </div>
      );
    },
  },

  {
    title: formatMessage({ id: 'odc.components.TaskOrderModal.TaskFlowName' }), //任务流程名称
    dataIndex: 'name',
    key: 'name',
    className: 'drag-visible',
    ellipsis: true,
    width: 346,
    render: (name, record) => {
      return (
        <Tooltip
          title={
            record.builtIn
              ? formatMessage({
                  id: 'odc.components.TaskOrderModal.TheBuiltInProcessOf',
                })
              : //系统内置流程默认优先级最低，不支持修改
                null
          }
        >
          <Space size={5} className={record.builtIn && styles.disabled}>
            <Typography.Text ellipsis>{name}</Typography.Text>
            {!record.enabled && (
              <span
                title={formatMessage({
                  id: 'odc.components.TaskOrderModal.TaskFlowDisabled',
                })}

                /*任务流程已停用*/
              >
                <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />
              </span>
            )}
          </Space>
        </Tooltip>
      );
    },
  },

  {
    title: formatMessage({ id: 'odc.components.TaskOrderModal.TaskType' }), //任务类型
    width: 200,
    dataIndex: 'taskType',
    key: 'taskType',
    render: (taskType, record) => {
      return <div className={record.builtIn && styles.disabled}>{TaskTypeMap?.[taskType]}</div>;
    },
  },
];

interface ITaskRadioProps {
  value: TaskPageType;
  onChange: (value: TaskPageType) => void;
}

export const TaskRadio: React.FC<ITaskRadioProps> = (props) => {
  const { value, onChange } = props;
  const options = [
    {
      label: formatMessage({ id: 'odc.components.TaskOrderModal.Import' }), //导入
      value: TaskPageType.IMPORT,
    },

    {
      label: formatMessage({ id: 'odc.components.TaskOrderModal.Export' }), //导出
      value: TaskPageType.EXPORT,
    },

    {
      label: formatMessage({ id: 'odc.components.TaskOrderModal.AnalogData' }), //模拟数据
      value: TaskPageType.DATAMOCK,
    },

    {
      label: formatMessage({
        id: 'odc.components.TaskOrderModal.DatabaseChanges',
      }),

      //数据库变更
      value: TaskPageType.ASYNC,
    },

    {
      label: formatMessage({
        id: 'odc.components.TaskOrderModal.PartitionPlan',
      }),
      //分区计划
      value: TaskPageType.PARTITION_PLAN,
    },

    {
      label: formatMessage({ id: 'odc.components.TaskOrderModal.ShadowTable' }), //影子表
      value: TaskPageType.SHADOW,
    },

    {
      label: formatMessage({
        id: 'odc.components.TaskOrderModal.ApplyForConnectionPermissions',
      }),

      //申请连接权限
      value: TaskPageType.PERMISSION_APPLY,
    },

    {
      label: formatMessage({
        id: 'odc.components.TaskOrderModal.PlannedChange',
      }), //计划变更
      value: TaskPageType.ALTER_SCHEDULE,
    },
  ];

  const handleChange = ({ target: { value } }: RadioChangeEvent) => {
    onChange(value);
  };

  return (
    <Radio.Group optionType="button" options={options} onChange={handleChange} value={value} />
  );
};

const TaskOrderModal: React.FC<IProps> = inject('connectionStore')(
  observer((props) => {
    const { visible, onClose } = props;
    const [value, setValue] = useState(TaskPageType.IMPORT);
    const [sortedKeys, setsortedKeys] = useState([]);
    const [dataSource, setDataSource] = useState<Record<TaskPageType, ITaskFlowConfig[]>>(null);
    const ref = useRef();

    const handleChange = (value: TaskPageType) => {
      setValue(value);
    };

    const loadData = async () => {
      const data = {};
      const res = await getTaskFlowList({
        sort: 'priority,desc',
      });

      res?.contents?.forEach((item) => {
        if (data[item.taskType]) {
          data[item.taskType].push(item);
        } else {
          data[item.taskType] = [item];
        }
      });
      setDataSource(data as Record<TaskPageType, ITaskFlowConfig[]>);
    };

    const handleSave = async () => {
      const sortedData = {};
      sortedKeys?.forEach((key) => {
        sortedData[key] = dataSource?.[key];
      });
      const data = await updatePriority(sortedData as Record<TaskPageType, ITaskFlowConfig[]>);
      if (data) {
        message.success(
          formatMessage({
            id: 'odc.components.TaskOrderModal.SavedSuccessfully',
          }),

          //保存成功
        );
        onClose();
      } else {
        message.error(
          formatMessage({
            id: 'odc.components.TaskOrderModal.SavedSuccessfully',
          }),

          //保存成功
        );
      }
    };

    const handleSourceChange = (source: ITaskFlowConfig[]) => {
      const keys = [...sortedKeys];
      const data = {
        ...dataSource,
        [value]: source,
      };

      if (!keys.includes(value)) {
        keys.push(value);
        setsortedKeys(keys);
      }
      setDataSource(data);
    };

    useEffect(() => {
      if (visible) {
        loadData();
      }
    }, [visible]);

    return (
      <Drawer
        className={styles.detailModal}
        visible={visible}
        title={formatMessage({
          id: 'odc.components.TaskOrderModal.SetPriority',
        })}
        /*设置优先级*/
        width={640}
        destroyOnClose
        onClose={() => {
          onClose();
        }}
        footer={
          <Space>
            <Button onClick={onClose}>
              {
                formatMessage({
                  id: 'odc.components.TaskOrderModal.Cancel',
                })

                /*取消*/
              }
            </Button>
            <Button onClick={handleSave} type="primary">
              {
                formatMessage({
                  id: 'odc.components.TaskOrderModal.Save',
                })

                /*保存*/
              }
            </Button>
          </Space>
        }
      >
        <Alert
          className={styles.alert}
          message={formatMessage({
            id: 'odc.components.TaskOrderModal.WhenMultipleProcessesAreAssociated',
          })}
          /*同一连接关联多个流程时，连接内的任务将按排序的优先级匹配流程*/
          type="info"
          showIcon
        />

        <Descriptions column={1} layout="vertical">
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.components.TaskOrderModal.TaskType',
            })}

            /*任务类型*/
          >
            <TaskRadio value={value} onChange={handleChange} />
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.components.TaskOrderModal.ProcessPriority',
            })}

            /*流程优先级*/
          >
            <div ref={ref}>
              <DraggableTable
                columns={columns}
                dataSource={dataSource?.[value] ?? []}
                wrapperRef={ref}
                onSourceChange={handleSourceChange}
              />
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    );
  }),
);

export default TaskOrderModal;
