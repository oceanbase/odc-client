import { ConnectTypeText } from '@/constant/label';
import { ConnectType } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover, Space, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect } from 'react';
import ParamContext from '../../ParamContext';
import FilterIcon from '../FIlterIcon';
import CheckboxTag from './CheckboxTag';

interface IProps {
  connectionStore?: ConnectionStore;
}

const Filter: React.FC<IProps> = function ({ connectionStore }) {
  const context = useContext(ParamContext);
  useEffect(() => {
    connectionStore.getLabelList();
  }, []);
  let displayDom = (
    <FilterIcon>
      <FilterOutlined />
    </FilterIcon>
  );

  function clear() {
    context.setConnectType([]);
  }
  const { connectType } = context;
  let selectedNames = [];
  connectType?.forEach((c) => {
    selectedNames.push(ConnectTypeText[c]);
  });
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
          {formatMessage({ id: 'odc.Header.Filter.Total' }) /*共*/}
          {selectedNames?.length}
          {formatMessage({ id: 'odc.Header.Filter.Item' }) /*项*/}
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
          <Typography.Text strong>
            {
              formatMessage({
                id: 'odc.Header.Filter.FilterConnections',
              }) /*筛选连接*/
            }
          </Typography.Text>
          <a onClick={clear}>{formatMessage({ id: 'odc.Header.Filter.Clear' }) /*清空*/}</a>
        </div>
      }
      content={
        <div>
          <Space direction="vertical" size={16}>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({ id: 'odc.Header.Filter.Type' }) /*类型*/}
              </Typography.Text>
              <CheckboxTag
                value={context?.connectType}
                options={[
                  ConnectType.OB_ORACLE,
                  ConnectType.OB_MYSQL,
                  ConnectType.CLOUD_OB_ORACLE,
                  ConnectType.CLOUD_OB_MYSQL,
                  ConnectType.ODP_SHARDING_OB_MYSQL,
                ].map((v) => ({ label: ConnectTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setConnectType(v as ConnectType[]);
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

export default inject('connectionStore')(observer(Filter));
