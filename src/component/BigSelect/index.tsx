import Icon from '@ant-design/icons';
import { Select, Space } from 'antd';
import styles from './index.less';

import ProjectSvg from '@/svgr/project_space.svg';

interface IBigSelectProps {
  defaultValue?: string | number;
  value?: string | number;
  icon: any;
  options: {
    value: string | number;
    label: string;
  }[];
  onChange?: (value: string | number) => void;
  bottom?: React.ReactNode;
}
const BigSelect: React.FC<IBigSelectProps> = (props) => {
  const { defaultValue, options, bottom, icon, onChange } = props;
  return (
    <Space size={12} className={styles['select-wrapper']}>
      <div className={styles.logo}>
        <Icon component={icon || ProjectSvg} />
      </div>
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
