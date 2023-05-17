import { SpaceType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
import { CheckOutlined, SwapOutlined, TeamOutlined } from '@ant-design/icons';
import { Select, Space } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { history } from 'umi';
import styles from './index.less';

interface ISpaceSelect {
  collapsed: boolean;
  userStore?: UserStore;
}
const SpaceSelect: React.FC<ISpaceSelect> = (props) => {
  const { collapsed, userStore } = props;

  const handleChange = async (oriId: number) => {
    const ori = userStore?.user?.belongedToOrganizations?.find((item) => item.id == oriId);
    const isSuccess = await userStore?.switchCurrentOrganization(oriId);
    if (!isSuccess) {
      return;
    }

    if (ori?.type === SpaceType.SYNERGY) {
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
      value={userStore?.user?.organizationId}
      suffixIcon={<SwapOutlined />}
      dropdownMatchSelectWidth={144}
      style={{ width: collapsed ? 40 : 144 }}
      bordered={false}
      menuItemSelectedIcon={<CheckOutlined />}
      onChange={handleChange}
      options={userStore.user?.belongedToOrganizations?.map((item) => {
        return {
          value: item.id,
          label:
            item.type === SpaceType.PRIVATE ? (
              <Space>
                <div className={styles.private}>
                  <TeamOutlined />
                </div>
                <span>{item.name}</span>
              </Space>
            ) : (
              <Space>
                <div className={styles.synergy}>
                  <TeamOutlined />
                </div>
                <span>{item.name}</span>
              </Space>
            ),
        };
      })}
    />
  );
};

export default inject('userStore')(observer(SpaceSelect));
