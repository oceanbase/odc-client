import CheckboxItem from '../Item/CheckboxItem';
import RadioItem from '../Item/RadioItem';
import { ODCSettingGroup } from '../config';
import { resultSetsGroup } from '../utils/configHelper';

export const getExecutionStrategyConfig = (taskGroup: ODCSettingGroup) => {
  return [
    {
      label: '数据库变更默认执行方式',
      key: 'odc.task.databaseChange.executionStrategy',
      locationKey: 'executionStrategy',
      group: taskGroup,
      storeType: 'server' as const,
      render: (value, onChange) => {
        return (
          <RadioItem
            options={[
              {
                label: '立即执行',
                value: 'AUTO',
              },
              {
                label: '定时执行',
                value: 'TIMER',
              },
              {
                label: '手动执行',
                value: 'MANUAL',
              },
            ]}
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
      label: '支持查看查询结果',
      key: 'odc.task.databaseChange.allowShowResultSets',
      locationKey: 'allowShowResultSets',
      group: taskGroup,
      storeType: 'server' as const,
      hidden: true,
      render: () => null,
    },
    {
      label: '支持下载查询结果',
      key: 'odc.task.databaseChange.allowDownloadResultSets',
      locationKey: 'allowDownloadResultSets',
      group: taskGroup,
      storeType: 'server' as const,
      hidden: true,
      render: () => null,
    },
    {
      label: '数据库变更查询结果',
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
