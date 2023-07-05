import { getConnectionList } from '@/common/network/connection';
import { listMaskingAlgorithm } from '@/common/network/maskingAlgorithm';
import { statsSensitiveColumns } from '@/common/network/sensitiveColumn';
import { listSensitiveRules } from '@/common/network/sensitiveRule';
import { IDatasource } from '@/d.ts/datasource';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { useEffect, useState } from 'react';
import SecureLayout from '../../Secure/components/SecureLayout';
import SecureSider, { SiderItem } from '../../Secure/components/SecureSider';
import SensitiveColumn from './components/SensitiveColumn';
import SensitiveRule from './components/SensitiveRule';
import styles from './index.less';
import { FilterItemProps, SelectItemProps } from './interface';
import SensitiveContext from './SensitiveContext';

const Sensitive: React.FC<{ id: number }> = ({ id }) => {
  const [selectedItem, setSelectedItem] = useState<string>('sensitiveColumn');
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);

  const [dataSourceIdMap, setDataSourceIdMap] = useState<{
    [key in string | number]: string;
  }>({});
  const [sensitiveRuleIdMap, setSensitiveRuleIdMap] = useState<{
    [key in string | number]: string;
  }>({});
  const [maskingAlgorithmIdMap, setMaskingAlgorithmIdMap] = useState<{
    [key in string | number]: string;
  }>({});
  const [maskingAlgorithms, setMaskingAlgorithms] = useState<IMaskingAlgorithm[]>([]);
  const [dataSources, setDataSources] = useState<IDatasource[]>([]);
  const [maskingAlgorithmOptions, setMaskingAlgorithmOptions] = useState<SelectItemProps[]>();

  const [dataSourceFilters, setDataSourceFilters] = useState<FilterItemProps[]>();
  const [databaseFilters, setDatabaseFilters] = useState<FilterItemProps[]>();
  const [maskingAlgorithmFilters, setMaskingAlgorithmFilters] = useState<FilterItemProps[]>();

  const getStatsSensitiveColumns = async (maskingAlgorithmIdMap: {
    [key in string | number]: string;
  }) => {
    const rawData = await statsSensitiveColumns(id);
    initSensitiveColumnFilters(rawData, maskingAlgorithmIdMap);
  };

  const initSensitiveColumnFilters = (
    rawData: {
      datasource: {
        distinct: string[];
      };
      database: {
        distinct: string[];
      };
      maskingAlgorithmId: {
        distinct: string[];
      };
    },
    maskingAlgorithmIdMap: {
      [key in string | number]: string;
    },
  ) => {
    const {
      datasource: { distinct: datasource = [] },
      database: { distinct: database = [] },
      maskingAlgorithmId: { distinct: maskingAlgorithmId = [] },
    } = rawData;
    setDataSourceFilters(
      datasource?.map((d) => ({
        text: d,
        value: d,
      })),
    );
    setDatabaseFilters(
      database?.map((d) => ({
        text: d,
        value: d,
      })),
    );
    setMaskingAlgorithmFilters(
      maskingAlgorithmId?.map((d) => ({
        text: maskingAlgorithmIdMap[d],
        value: d,
      })),
    );
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item.value);
  };

  const initSiderData = async () => {
    const siderItems = [
      {
        value: 'sensitiveColumn',
        label: '敏感列',
      },
      {
        value: 'detectRule',
        label: '识别规则',
      },
    ];
    handleItemClick(siderItems[0]);
    setSiderItemList(siderItems);
  };

  const getListMaskingAlgorithm = async (): Promise<{
    [key in string | number]: string;
  }> => {
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

  const getListDataSources = async () => {
    const rawData = await getConnectionList({});
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
    initSiderData();
  };
  const renderBySelectedItem = (selectedItem: string) => {
    switch (selectedItem) {
      case 'sensitiveColumn': {
        return (
          <SensitiveColumn
            {...{
              projectId: id,
              dataSourceFilters,
              databaseFilters,
              maskingAlgorithmFilters,
            }}
          />
        );
      }
      case 'detectRule': {
        return <SensitiveRule projectId={id} />;
      }
    }
  };
  useEffect(() => {
    initSensitiveColumn();
  }, []);
  return (
    <SecureLayout>
      <SecureSider
        siderItemList={siderItemList}
        selectedItem={selectedItem}
        handleItemClick={handleItemClick}
      />
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
        <div className={styles.sensitive}>{renderBySelectedItem(selectedItem)}</div>
      </SensitiveContext.Provider>
    </SecureLayout>
  );
};

export default Sensitive;
