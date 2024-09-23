import { ConnectTypeText, DBTypeText } from '@/constant/label';
import { ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover, Space, Typography } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../../ParamContext';
import FilterIcon from '@/page/Datasource/Datasource/Header/FIlterIcon';
import { getAllConnectTypes, getAllDBTypes } from '@/common/datasource';
import CheckboxTag from '@/component/CheckboxTag';
import { DBType } from '@/d.ts/database';

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
      connectType: [],
      environmentId: [],
      type: [],
    });
  }
  const { connectType, type, environmentId } = context?.filterParams;
  let selectedNames = [];
  connectType?.forEach((c) => {
    selectedNames.push(ConnectTypeText[c]);
  });
  type?.forEach((c) => {
    selectedNames.push(DBTypeText[c]);
  });
  environmentId?.forEach((c) => {
    selectedNames.push(context?.envList?.find((i) => i?.id === c)?.name);
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
          <Typography.Text strong>
            {formatMessage({
              id: 'src.page.Project.Database.Header.Filter.3C4103AA',
              defaultMessage: '筛选',
            })}
          </Typography.Text>
          <a onClick={clear}>
            {formatMessage({ id: 'odc.Header.Filter.Clear', defaultMessage: '清空' }) /*清空*/}
          </a>
        </div>
      }
      content={
        <div>
          <Space direction="vertical" size={16}>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.page.Project.Database.Header.Filter.ADA9E6A7',
                  defaultMessage: '数据源类型',
                })}
              </Typography.Text>
              <CheckboxTag
                value={context?.filterParams?.connectType}
                options={[]
                  .concat(getAllConnectTypes())
                  .map((v) => ({ label: ConnectTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    connectType: v as ConnectType[],
                  });
                }}
              />
            </Space>

            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.page.Project.Database.Header.Filter.BCBEF8AA',
                  defaultMessage: '数据库类型',
                })}
              </Typography.Text>
              <CheckboxTag
                value={context?.filterParams?.type}
                options={[]
                  .concat(getAllDBTypes())
                  .map((v) => ({ label: DBTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    type: v as DBType[],
                  });
                }}
              />
            </Space>

            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.page.Project.Database.Header.Filter.F048B0EE',
                  defaultMessage: '环境',
                })}
              </Typography.Text>
              <CheckboxTag
                value={context?.filterParams?.environmentId}
                options={[].concat(context?.envList).map((v) => ({ label: v?.name, value: v?.id }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    environmentId: v as number[],
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
