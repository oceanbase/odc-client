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

import { TaskDetail, TaskRecordParameters } from '@/d.ts';
import { Descriptions, Divider, Space, Typography } from 'antd';
import { isArray, isFunction } from 'lodash';
import React, { ReactNode } from 'react';
import styles from './index.less';

export interface ITaskInfoProps {
  taskItems: {
    /**
     * 片段标题，例如标题+表格
     */
    sectionName?: string;
    /**
     * 片段描述信息
     */
    textItems: [string, string | number, number?][];
    /**
     * 自定义渲染逻辑
     */
    sectionRender?: (task: TaskDetail<TaskRecordParameters>) => void;
  }[];
  task: TaskDetail<TaskRecordParameters>;
  /**
   * 是否需要分割
   */
  isSplit?: boolean;
}

const TaskInfo: React.FC<ITaskInfoProps> = function (props) {
  const { taskItems = [], task, isSplit = true } = props;
  if (!isArray(taskItems) || !task) {
    return null;
  }

  function renderTextItems(textItems: [ReactNode, ReactNode, number?][]) {
    return (
      <Descriptions column={2}>
        {textItems.map((textItem) => {
          return (
            <Descriptions.Item span={textItem[2] || 1} label={textItem[0]}>
              {textItem[1]}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
    );
  }

  return (
    <Space
      className={styles.taskinfo}
      direction="vertical"
      style={{ width: '100%' }}
      split={isSplit ? <Divider /> : null}
    >
      {taskItems.map((taskItem) => {
        const { sectionName, textItems, sectionRender } = taskItem;
        const content = isFunction(sectionRender)
          ? sectionRender(task)
          : renderTextItems(textItems);
        return sectionName ? (
          <Space direction="vertical" style={{ width: '100%' }} size={'middle'}>
            <Typography.Text>{sectionName}</Typography.Text>
            {content}
          </Space>
        ) : (
          content
        );
      })}
    </Space>
  );
};

export default TaskInfo;
