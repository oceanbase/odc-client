import { formatMessage } from '@/util/intl';
import { SortAscendingOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import React, { useContext } from 'react';
import ParamContext, { SortType } from '../../ParamContext';
import FilterIcon from '../FIlterIcon';

interface IProps {}

const Sorter: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  return (
    <Dropdown
      trigger={['hover']}
      overlay={
        <Menu
          selectedKeys={[context?.sortType]}
          onClick={(v) => {
            if (context?.sortType === v.key) {
              context.setSortType?.(null);
              return;
            }
            context.setSortType?.(v.key as SortType);
          }}
        >
          <Menu.Item key={SortType.CREATE_TIME}>
            {
              formatMessage({
                id: 'odc.Header.Sorter.SortByCreationTime',
              }) /*按创建时间排序*/
            }
          </Menu.Item>
          <Menu.Item key={SortType.UPDATE_TIME}>
            {
              formatMessage({
                id: 'odc.Header.Sorter.SortByUpdateTime',
              }) /*按更新时间排序*/
            }
          </Menu.Item>
          <Menu.Item key={SortType.NAME_AZ}>
            {
              formatMessage({
                id: 'odc.Header.Sorter.SortByDataSourceName',
              }) /*按数据源名(A-Z)排序*/
            }
          </Menu.Item>
          <Menu.Item key={SortType.NAME_ZA}>
            {
              formatMessage({
                id: 'odc.Header.Sorter.SortByDataSourceName.1',
              }) /*按数据源名(Z-A)排序*/
            }
          </Menu.Item>
        </Menu>
      }
    >
      <FilterIcon isActive={!!context?.sortType}>
        <SortAscendingOutlined />
      </FilterIcon>
    </Dropdown>
  );
};

export default Sorter;
