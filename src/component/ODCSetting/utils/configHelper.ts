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
// 聚合配置项定义
interface AggregateConfig {
  key: string; // 聚合配置的 key
  subKeys: string[]; // 包含的子配置项 keys
}

// 定义聚合配置映射
const AGGREGATE_CONFIGS: AggregateConfig[] = [
  {
    key: 'databaseChangeResultSets',
    subKeys: [
      'odc.task.databaseChange.allowShowResultSets',
      'odc.task.databaseChange.allowDownloadResultSets',
    ],
  },
];

export const resultSetsGroup = [
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.utils.E642F884',
      defaultMessage: '支持查看查询结果',
    }),
    value: 'odc.task.databaseChange.allowShowResultSets',
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.utils.9CE1F69C',
      defaultMessage: '支持下载查询结果',
    }),
    value: 'odc.task.databaseChange.allowDownloadResultSets',
  },
];

export class ConfigHelper {
  /**
   * 将原始配置数据转换为包含聚合配置的数据
   */
  static transformLoadData(rawData: Record<string, any>): Record<string, any> {
    const transformedData = { ...rawData };

    AGGREGATE_CONFIGS.forEach((config) => {
      // 将子配置项聚合成数组
      const aggregateValue = config.subKeys.filter(
        (subKey) => rawData[subKey] === 'true' || rawData[subKey] === true,
      );
      transformedData[config.key] = aggregateValue;
    });

    return transformedData;
  }

  /**
   * 将包含聚合配置的数据展开为原始配置数据
   */
  static transformSaveData(formData: Record<string, any>): Record<string, any> {
    const expandedData = { ...formData };

    AGGREGATE_CONFIGS.forEach((config) => {
      const aggregateValue = formData[config.key];

      if (Array.isArray(aggregateValue)) {
        // 展开聚合配置
        config.subKeys.forEach((subKey) => {
          expandedData[subKey] = aggregateValue.includes(subKey) ? 'true' : 'false';
        });

        // 删除聚合配置项
        delete expandedData[config.key];
      }
    });

    return expandedData;
  }
}
