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
import CheckboxItem from '../Item/CheckboxItem';
import RadioItem from '../Item/RadioItem';
import { ODCSettingGroup } from '../config';
import { resultSetsGroup } from '../utils/configHelper';
import { isClient } from '@/util/env';

export const getExecutionStrategyConfig = (taskGroup: ODCSettingGroup) => {
  return [
    {
      label: formatMessage({
        id: 'src.component.ODCSetting.config.C6A45A24',
        defaultMessage: '数据库变更默认执行方式',
      }),
      key: 'odc.task.databaseChange.executionStrategy',
      locationKey: 'executionStrategy',
      group: taskGroup,
      storeType: 'server' as const,
      render: (value, onChange) => {
        return (
          <RadioItem
            options={[
              {
                label: formatMessage({
                  id: 'src.component.ODCSetting.config.00714039',
                  defaultMessage: '立即执行',
                }),
                value: 'AUTO',
              },
              !isClient()
                ? {
                    label: formatMessage({
                      id: 'src.component.ODCSetting.config.11DE5799',
                      defaultMessage: '定时执行',
                    }),
                    value: 'TIMER',
                  }
                : null,
              {
                label: formatMessage({
                  id: 'src.component.ODCSetting.config.7CE2AC8D',
                  defaultMessage: '手动执行',
                }),
                value: 'MANUAL',
              },
            ]?.filter(Boolean)}
            value={value}
            onChange={onChange}
          />
        );
      },
    },
  ];
};

export const getDatabaseChangeResultSetsConfig = (taskGroup: ODCSettingGroup) => {
  return [
    {
      label: formatMessage({
        id: 'src.component.ODCSetting.config.AB482BC7',
        defaultMessage: '支持查看查询结果',
      }),
      key: 'odc.task.databaseChange.allowShowResultSets',
      locationKey: 'allowShowResultSets',
      group: taskGroup,
      storeType: 'server' as const,
      hidden: true,
      render: () => null,
    },
    {
      label: formatMessage({
        id: 'src.component.ODCSetting.config.3FE1F2A7',
        defaultMessage: '支持下载查询结果',
      }),
      key: 'odc.task.databaseChange.allowDownloadResultSets',
      locationKey: 'allowDownloadResultSets',
      group: taskGroup,
      storeType: 'server' as const,
      hidden: true,
      render: () => null,
    },
    {
      label: formatMessage({
        id: 'src.component.ODCSetting.config.1ED38C41',
        defaultMessage: '数据库变更查询结果',
      }),
      key: 'databaseChangeResultSets',
      locationKey: 'databaseChangeResultSets',
      group: taskGroup,
      storeType: 'server' as const,
      render: (value, onChange) => {
        return <CheckboxItem value={value} options={resultSetsGroup} onChange={onChange} />;
      },
    },
  ];
};
