import React, { useEffect } from 'react';
import SessionDropdown from './SessionDropdown';
import SessionContext from '../context';
import { Divider, Input, Select, Space } from 'antd';
import { useRequest } from 'ahooks';
import { getDatabase } from '@/common/network/database';
import Icon from '@ant-design/icons';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { TaskType } from '@/d.ts';

interface IProps {
  value?: number;
  taskType?: TaskType;
  fetchType?: TaskType;
  projectId?: number;
  onChange?: (value: number) => void;
}

const SelectItem: React.FC<IProps> = ({ value, taskType, projectId, fetchType, onChange }) => {
  const { data: database, run } = useRequest(getDatabase, {
    manual: true,
  });
  useEffect(() => {
    if (value) {
      run(value);
    }
  }, [value]);
  const dbIcon = getDataSourceStyleByConnectType(database?.data?.dataSource?.type)?.dbIcon;
  return (
    <SessionContext.Provider
      value={{
        session: null,
        databaseId: value,
        from: 'datasource',
        selectSession(databaseId: number, datasourceId: number, from: 'project' | 'datasource') {
          onChange(databaseId);
        },
      }}
    >
      <Space direction="vertical">
        <SessionDropdown
          projectId={projectId}
          width={400}
          taskType={taskType}
          fetchType={fetchType}
        >
          <Select
            placeholder={
              <Space size={1} style={{ color: 'var(--text-color-primary)' }}>
                {database?.data ? (
                  <>
                    <RiskLevelLabel
                      content={database?.data?.environment?.name}
                      color={database?.data?.environment?.style}
                    />
                    <Icon
                      component={dbIcon?.component}
                      style={{ fontSize: 16, marginRight: 4, verticalAlign: 'textBottom' }}
                    />
                  </>
                ) : null}
                {database?.data?.name}
              </Space>
            }
            style={{ width: 400 }}
            open={false}
          />
        </SessionDropdown>
        {database?.data ? (
          <Space
            size={2}
            split={<Divider type="vertical" />}
            style={{ color: 'var(--text-color-hint)' }}
          >
            <span>项目：{database?.data?.project?.name}</span>
            <span>数据源：{database?.data?.dataSource?.name}</span>
          </Space>
        ) : null}
      </Space>
    </SessionContext.Provider>
  );
};

export default SelectItem;
