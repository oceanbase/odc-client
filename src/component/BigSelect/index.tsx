import { Select, Space } from 'antd';
import { Link } from 'umi';
import styles from './index.less';

interface IBigSelectProps {
  defaultValue?: string | number;
  value?: string | number;
  options: {
    value: string | number;
    label: string;
  }[];
  onChange?: (value: string | number) => void;
}
const BigSelect: React.FC<IBigSelectProps> = (props) => {
  const { defaultValue, options, onChange } = props;
  return (
    <Space size={12} className={styles['select-wrapper']}>
      <div className={styles.logo}></div>
      <Select
        className={styles.select}
        defaultValue={defaultValue}
        bordered={false}
        options={options}
        dropdownMatchSelectWidth={280}
        onChange={onChange}
        listHeight={170}
        dropdownRender={(menu) => (
          <>
            {menu}
            <div className={styles['select-footer']}>
              <Link to="/project">查看全部项目</Link>
            </div>
          </>
        )}
      />
    </Space>
  );
};

export default BigSelect;
