import { SpaceType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
import PersonalSvg from '@/svgr/personal_space.svg';
import GroupSvg from '@/svgr/project_space.svg';
import Icon, { CheckOutlined, SwapOutlined } from '@ant-design/icons';
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
      style={{ width: collapsed ? 30 : 144 }}
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
                  <Icon component={PersonalSvg} />
                </div>
                <span>{item.displayName || '-'}</span>
              </Space>
            ) : (
              <Space>
                <div className={styles.synergy}>
                  <Icon component={GroupSvg} />
                </div>
                <span>{item.displayName || '-'}</span>
              </Space>
            ),
        };
      })}
    />
  );
};

export default inject('userStore')(observer(SpaceSelect));
