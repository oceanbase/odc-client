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

import { getConnectionList } from '@/common/network/connection';
import { listMaskingAlgorithm } from '@/common/network/maskingAlgorithm';
import { statsSensitiveColumns } from '@/common/network/sensitiveColumn';
import { listSensitiveRules } from '@/common/network/sensitiveRule';
import { IDatasource } from '@/d.ts/datasource';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { useEffect, useState } from 'react';
import SensitiveColumn from './components/SensitiveColumn';
import styles from './index.less';
import { FilterItemProps, SelectItemProps } from './interface';
import SensitiveContext from './SensitiveContext';
import tracert from '@/util/tracert';

const Sensitive: React.FC<{ id: number }> = ({ id }) => {
  const [dataSourceIdMap, setDataSourceIdMap] = useState<
    {
      [key in string | number]: string;
    }
  >({});
  const [sensitiveRuleIdMap, setSensitiveRuleIdMap] = useState<
    {
      [key in string | number]: string;
    }
  >({});
  const [maskingAlgorithmIdMap, setMaskingAlgorithmIdMap] = useState<
    {
      [key in string | number]: string;
    }
  >({});
  const [maskingAlgorithms, setMaskingAlgorithms] = useState<IMaskingAlgorithm[]>([]);
  const [dataSources, setDataSources] = useState<IDatasource[]>([]);
  const [maskingAlgorithmOptions, setMaskingAlgorithmOptions] = useState<SelectItemProps[]>();
  const [maskingAlgorithmFilters, setMaskingAlgorithmFilters] = useState<FilterItemProps[]>();
  const [cascaderOptions, setCascaderOptions] = useState<any>([]);
  useEffect(() => {
    tracert.expo('a3112.b64002.c330861');
  }, []);

  const getStatsSensitiveColumns = async (
    maskingAlgorithmIdMap: {
      [key in string | number]: string;
    },
  ) => {
    const rawData = await statsSensitiveColumns(id);
    initSensitiveColumnFilters(rawData, maskingAlgorithmIdMap);
  };

  const initSensitiveColumnFilters = (
    rawData: any,
    maskingAlgorithmIdMap: {
      [key in string | number]: string;
    },
  ) => {
    const { databases = [], maskingAlgorithms = [] } = rawData;
    const map = {};
    databases?.forEach((database) => {
      const dataSourceName = database?.dataSource?.name;
      if (map?.[dataSourceName]) {
        map?.[dataSourceName].children.push({
          label: database?.name,
          value: database?.id,
        });
      } else {
        map[dataSourceName] = {
          id: database?.dataSource?.id,
          children: [
            {
              label: database?.name,
              value: database?.id,
            },
          ],
        };
      }
    });
    setCascaderOptions(
      Object.keys(map)?.map((key) => ({
        label: key,
        value: map?.[key]?.id,
        children: map?.[key]?.children,
      })),
    );
    setMaskingAlgorithmFilters(
      maskingAlgorithms?.map((ma) => ({
        text: maskingAlgorithmIdMap[ma?.id],
        value: ma?.id,
      })),
    );
  };

  const getListMaskingAlgorithm = async (): Promise<
    {
      [key in string | number]: string;
    }
  > => {
    const rawData = await listMaskingAlgorithm();
    setMaskingAlgorithms(rawData?.contents);

    const map = {};
    rawData?.contents?.forEach((data) => {
      map[data.id] = data.name;
    });
    setMaskingAlgorithmIdMap(map);

    const options = rawData?.contents?.map((data) => ({
      label: data.name,
      value: data.id,
    }));
    setMaskingAlgorithmOptions(options);
    return map;
  };

  const getListSensitiveRules = async () => {
    const rawData = await listSensitiveRules(id);

    const map = {};
    rawData?.contents?.forEach((d) => {
      map[d.id] = d.name;
    });
    setSensitiveRuleIdMap(map);
  };

  const getListDataSources = async (projectId?: number) => {
    const rawData = await getConnectionList({ projectId: id });
    setDataSources(rawData?.contents);

    const map = {};
    rawData?.contents?.forEach((d) => {
      map[d?.id] = d?.name;
    });
    setDataSourceIdMap(map);
  };
  const initSensitiveColumn = async () => {
    const map = await getListMaskingAlgorithm();
    getStatsSensitiveColumns(map);
    getListDataSources();
    getListSensitiveRules();
  };
  return (
    <SensitiveContext.Provider
      value={{
        projectId: id,
        dataSources,
        dataSourceIdMap,
        maskingAlgorithms,
        maskingAlgorithmIdMap,
        maskingAlgorithmOptions,
        sensitiveRuleIdMap,
      }}
    >
      <div className={styles.sensitive}>
        <SensitiveColumn
          projectId={id}
          cascaderOptions={cascaderOptions}
          maskingAlgorithmFilters={maskingAlgorithmFilters}
          initSensitiveColumn={initSensitiveColumn}
        />
      </div>
    </SensitiveContext.Provider>
  );
};

export default Sensitive;
