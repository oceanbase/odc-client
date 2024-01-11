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
import login from '@/store/login';

interface IProps {
  value?: number;
  taskType?: TaskType;
  width?: number | string;
  projectId?: number;
  onChange?: (value: number) => void;
}

const SelectItem: React.FC<IProps> = ({ value, taskType, projectId, width, onChange }) => {
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
      <Space style={{ width: '100%' }} direction="vertical">
        <SessionDropdown projectId={projectId} width={width || 320} taskType={taskType}>
          <Select
            placeholder={
              <Space size={1} style={{ color: 'var(--text-color-primary)', width: '100%' }}>
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
            style={{ width: width || 320 }}
            open={false}
          />
        </SessionDropdown>
        {database?.data ? (
          <Space
            size={2}
            split={<Divider type="vertical" />}
            style={{ color: 'var(--text-color-hint)' }}
          >
            {login.isPrivateSpace() ? null : <span>项目：{database?.data?.project?.name}</span>}
            <span>数据源：{database?.data?.dataSource?.name}</span>
          </Space>
        ) : null}
      </Space>
    </SessionContext.Provider>
  );
};

export default SelectItem;
