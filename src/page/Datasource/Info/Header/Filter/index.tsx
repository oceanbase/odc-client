import { DatabaseAvailableTypeText, DatabaseBelongsToProjectTypeText } from '@/constant/label';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover, Space, Typography } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../../ParamContext';
import FilterIcon from '@/page/Datasource/Datasource/Header/FIlterIcon';
import {
  getIsDBAvailableInDataSourceTypes,
  getIsDBBelongsToProjectsInDataSourceTypes,
} from '@/common/datasource';
import RadioTag from '@/component/RadioTag';

interface IProps {}

const Filter: React.FC<IProps> = function ({}) {
  const context = useContext(ParamContext);
  let displayDom = (
    <FilterIcon>
      <FilterOutlined />
    </FilterIcon>
  );

  function clear() {
    context.setFilterParams({
      existed: undefined,
      belongsToProject: undefined,
    });
  }
  const { existed, belongsToProject } = context?.filterParams;
  let selectedNames = [];

  existed !== undefined && selectedNames.push(DatabaseAvailableTypeText[String(existed)]);
  belongsToProject !== undefined &&
    selectedNames.push(DatabaseBelongsToProjectTypeText[String(belongsToProject)]);

  if (selectedNames.length) {
    displayDom = (
      <div
        style={{
          padding: '4px 8px',
          lineHeight: '20px',
          color: 'var(--text-color-secondary)',
          background: 'var(--hover-color)',
        }}
      >
        {selectedNames.slice(0, 3)?.join(';')}
        {selectedNames?.length > 3 ? '...' : ''}
        <span style={{ marginLeft: 3 }}>
          {formatMessage({ id: 'odc.Header.Filter.Total', defaultMessage: '共' }) /*共*/}
          {selectedNames?.length}
          {formatMessage({ id: 'odc.Header.Filter.Item', defaultMessage: '项' }) /*项*/}
        </span>
        <CloseOutlined onClick={clear} style={{ cursor: 'pointer', marginLeft: 15 }} />
      </div>
    );
  }

  return (
    <Popover
      placement="bottomRight"
      overlayStyle={{ width: 300 }}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Text strong>筛选</Typography.Text>
          <a onClick={clear}>
            {formatMessage({ id: 'odc.Header.Filter.Clear', defaultMessage: '清空' }) /*清空*/}
          </a>
        </div>
      }
      content={
        <div>
          <Space direction="vertical" size={16}>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">数据库状态</Typography.Text>
              <RadioTag
                value={context?.filterParams?.existed}
                options={[]
                  .concat(getIsDBAvailableInDataSourceTypes())
                  .map((v) => ({ label: DatabaseAvailableTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    existed: v,
                  });
                }}
              />
            </Space>

            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">数据库分配</Typography.Text>
              <RadioTag
                value={context?.filterParams?.belongsToProject}
                options={[]
                  .concat(getIsDBBelongsToProjectsInDataSourceTypes())
                  .map((v) => ({ label: DatabaseBelongsToProjectTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    belongsToProject: v,
                  });
                }}
              />
            </Space>
          </Space>
        </div>
      }
    >
      {displayDom}
    </Popover>
  );
};

export default Filter;
