import { SpaceType } from '@/d.ts/_index';
import { CheckOutlined, SwapOutlined, TeamOutlined } from '@ant-design/icons';
import { Select, Space } from 'antd';
import classNames from 'classnames';
import { history } from 'umi';
import styles from './index.less';

interface ISpaceSelect {
  collapsed: boolean;
}
const SpaceSelect: React.FC<ISpaceSelect> = (props) => {
  const { collapsed } = props;

  const handleChange = (value: string) => {
    if (value === SpaceType.SYNERGY) {
      history.push('/project');
    } else {
      history.push('/sqlworkspace');
    }
  };

  return (
    <Select
      className={classNames(styles['space-switch'], {
        [styles.collapsed]: collapsed,
      })}
      defaultValue={SpaceType.SYNERGY}
      suffixIcon={<SwapOutlined />}
      dropdownMatchSelectWidth={144}
      style={{ width: collapsed ? 40 : 144 }}
      bordered={false}
      menuItemSelectedIcon={<CheckOutlined />}
      onChange={handleChange}
      options={[
        {
          value: SpaceType.SYNERGY,
          label: (
            <Space>
              <div className={styles.synergy}>
                <TeamOutlined />
              </div>
              <span>团队空间</span>
            </Space>
          ),
        },
        {
          value: SpaceType.PRIVATE,
          label: (
            <Space>
              <div className={styles.private}>
                <TeamOutlined />
              </div>
              <span>个人空间</span>
            </Space>
          ),
        },
      ]}
    />
  );
};

export default SpaceSelect;
