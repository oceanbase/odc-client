import { formatMessage } from '@/util/intl';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React from 'react';
import styles from './index.less';

interface IProps {
  title: React.ReactNode;
  onChange: (e) => void;
}

const SearchBar: React.FC<IProps> = (props) => {
  const { title, onChange } = props;
  return (
    <div className={styles.searchBar}>
      <div className={styles.title}>{title}</div>
      <div className={styles.search}>
        <Input
          placeholder={formatMessage({
            id: 'odc.component.searchBar.SupportsSearchingForConnectionsHosts',
          })} /*支持搜索连接/主机/集群/租户*/
          prefix={<SearchOutlined />}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;
