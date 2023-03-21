import { actionTypes, canAcess } from '@/component/Acess';
import { IManagerResourceType } from '@/d.ts';
import { formatMessage, getLocalImg } from '@/util/intl';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useContext, useState } from 'react';
import { ManageContext } from '../../context';
import FormConnectionModal from '../FormConnectionModal';
import FormResourceGroupModal from '../FormResourceGroupModal';
import FormRoleModal from '../FormRoleModal';
import FormUserModal from '../FormUserModal';
import { menusConfig, resourceConfig } from './config';
import styles from './index.less';

enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
}

const IndexPage: React.FC<null> = () => {
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [visibleKey, setVisibleKey] = useState<IManagerResourceType>(null);
  const { roles } = useContext(ManageContext);
  function handleCloseModal() {
    setVisibleKey(null);
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.banner}>
          <div className={styles.title}>
            {
              formatMessage({
                id: 'odc.components.IndexPage.WelcomeToThePublicResource',
              }) /*欢迎使用公共资源管控台*/
            }
          </div>
          <div className={styles.desc}>
            {
              formatMessage({
                id: 'odc.components.IndexPage.TextToBeDeterminedEasily',
              }) /*轻松管理用户资源权限，规范配置风险任务流程，保障数据资源的安全管控*/
            }
          </div>
          <span className={styles.iconBtn}>
            {direction === Direction.UP ? (
              <UpOutlined
                onClick={() => {
                  setDirection(Direction.DOWN);
                }}
              />
            ) : (
              <DownOutlined
                onClick={() => {
                  setDirection(Direction.UP);
                }}
              />
            )}
          </span>
        </div>
        {direction === Direction.UP && (
          <ul className={styles.menuList}>
            {menusConfig.map((item, i) => {
              const { icon, title, describe } = item;
              return (
                <li key={i} className={styles.menuItem}>
                  <img className={styles.icon} src={icon} alt="" />
                  <div className={styles.content}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.desc}>{describe}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.title}>
          {
            formatMessage({
              id: 'odc.components.IndexPage.HowToManageResourcePermissions',
            }) /*如何管理资源权限*/
          }
        </div>
        <div className={styles.main}>
          <ul className={styles.resourceList}>
            {resourceConfig.map((item, index) => {
              const { key, type, title, describe } = item;
              const enableCreate = canAcess({
                resourceIdentifier: key,
                action: actionTypes.create,
              }).accessible;
              return (
                <li key={key} className={styles.resourceItem}>
                  <div className={styles.index}>{index + 1}</div>
                  <div className={styles.content}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.desc}>{describe}</div>
                    <Button
                      type="link"
                      disabled={!enableCreate}
                      onClick={() => {
                        setVisibleKey(key);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.components.IndexPage.Create',
                        }) /*新建*/
                      }

                      {type}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={styles.resourceGroup}>
            <img
              src={getLocalImg('resource_group.png')}
              alt={formatMessage({
                id: 'odc.components.IndexPage.ResourceGroup',
              })}
              /*资源组*/ className={styles.bgImg}
            />
          </div>
        </div>
      </div>
      <FormUserModal
        role={[...roles.values()]}
        visible={visibleKey === IManagerResourceType.user}
        onClose={handleCloseModal}
      />

      <FormRoleModal
        visible={visibleKey === IManagerResourceType.role}
        onClose={handleCloseModal}
      />

      <FormResourceGroupModal
        visible={visibleKey === IManagerResourceType.resource_group}
        publicConnections={[]}
        onClose={handleCloseModal}
      />

      <FormConnectionModal
        visible={visibleKey === IManagerResourceType.public_connection}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default IndexPage;
