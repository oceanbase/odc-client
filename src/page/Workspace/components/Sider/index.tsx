import { ConnectionMode, DbObjectType, ResourceTabKey } from '@/d.ts'; // @ts-ignore
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import Icon, { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import { PureComponent } from 'react';

import { DbObjsIcon } from '@/constant';
import styles from './index.less';

const { Sider } = Layout;

@inject('settingStore', 'schemaStore', 'connectionStore')
@observer
export default class ResourceSider extends PureComponent<{
  activeResource: ResourceTabKey;
  onMenuClick: (param: any) => void;
  settingStore?: SettingStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
}> {
  private handleToggleCollapse = () => {
    const { settingStore } = this.props;
    settingStore!.toggleCollapsed(); // 侧边菜单收起有动画时间

    setTimeout(() => {
      // 手动触发 resize 事件
      window.dispatchEvent(new Event('resize'));
    }, 200);
  };

  public render() {
    const {
      // @ts-ignore
      settingStore: { collapsed },
      // @ts-ignore
      connectionStore: { connection },
      // @ts-ignore
      schemaStore: {
        enableFunction,
        enableProcedure,
        enableView,
        enablePackage,
        enableTrigger,
        enableType,
        enableSynonym,
      },

      onMenuClick,
      activeResource,
    } = this.props;
    const menus = [
      {
        title: formatMessage({ id: 'odc.components.Sider.Table' }), // 表
        key: ResourceTabKey.TABLE,
        icon: <Icon component={DbObjsIcon[DbObjectType.table]} className={styles.icon} />,

        enableRender: true,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.View' }), // 视图
        key: ResourceTabKey.VIEW,
        icon: <Icon component={DbObjsIcon[DbObjectType.view]} className={styles.icon} />,
        enableRender: enableView,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.Function' }), // 函数
        key: ResourceTabKey.FUNCTION,
        icon: <Icon component={DbObjsIcon[DbObjectType.function]} className={styles.icon} />,
        enableRender: enableFunction,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.StoredProcedure' }), // 存储过程
        key: ResourceTabKey.PROCEDURE,
        icon: <Icon component={DbObjsIcon[DbObjectType.procedure]} className={styles.icon} />,
        enableRender: enableProcedure,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.Package' }), // 程序包 // 包
        key: ResourceTabKey.PACKAGE,
        icon: <Icon component={DbObjsIcon[DbObjectType.package]} className={styles.icon} />,
        enableRender: enablePackage,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.Trigger' }), // 触发器
        key: ResourceTabKey.TRIGGER,
        icon: <Icon component={DbObjsIcon[DbObjectType.trigger]} className={styles.icon} />,
        enableRender: enableTrigger,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.Type' }), // 类型
        key: ResourceTabKey.TYPE,
        icon: <Icon component={DbObjsIcon[DbObjectType.type]} className={styles.icon} />,
        enableRender: enableType,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.Sequence' }), // 序列
        key: ResourceTabKey.SEQUENCE,
        icon: <Icon component={DbObjsIcon[DbObjectType.sequence]} className={styles.icon} />,
        enableRender: connection.dbMode === ConnectionMode.OB_ORACLE,
      },

      {
        title: formatMessage({ id: 'odc.components.Sider.Synonyms' }), // 同义词
        key: ResourceTabKey.SYNONYM,
        icon: <Icon component={DbObjsIcon[DbObjectType.synonym]} className={styles.icon} />,
        enableRender: enableSynonym,
      },
    ];

    return (
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={this.handleToggleCollapse}
        width={96}
        collapsedWidth={40}
        className={styles.sider}
        trigger={
          collapsed ? (
            <MenuUnfoldOutlined className={styles.icon} />
          ) : (
            <MenuFoldOutlined className={styles.icon} />
          )
        }
      >
        <Menu mode="inline" defaultSelectedKeys={[activeResource]} onClick={onMenuClick}>
          {menus.map((menu) =>
            menu.enableRender ? (
              <Menu.Item key={menu.key}>
                {menu.icon}
                <span className={styles.text}>{menu.title}</span>
              </Menu.Item>
            ) : null,
          )}
        </Menu>
      </Sider>
    );
  }
}
