import { Select, Space } from 'antd';
import styles from './index.less';

interface IBigSelectProps {
  defaultValue?: string | number;
  value?: string | number;
  options: {
    value: string | number;
    label: string;
  }[];
  onChange?: (value: string | number) => void;
  bottom?: React.ReactNode;
}
const BigSelect: React.FC<IBigSelectProps> = (props) => {
  const { defaultValue, options, bottom, onChange } = props;
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
            {bottom ? <div className={styles['select-footer']}>{bottom}</div> : null}
          </>
        )}
      />
    </Space>
  );
};

export default BigSelect;
