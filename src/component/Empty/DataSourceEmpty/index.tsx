import { Acess, createPermission } from '@/component/Acess';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import TitleButton from '@/page/Datasource/Datasource/Content/TitleButton';
import ParamContext from '@/page/Datasource/Datasource/ParamContext';
import { Result } from 'antd';
import { useContext } from 'react';
import styles from './index.less';

export function DataSourceEmpty({ extra }) {
  const paramContext = useContext(ParamContext);

  const renderSubTitle = () => {
    return (
      <Acess
        fallback={
          <div className={styles.subTitle}>
            <div>{'请联系管理员添加数据源；'}</div>
            <div>{'也可尝试切换至个人空间，自由管理个人数据源'}</div>
          </div>
        }
        {...createPermission(IManagerResourceType.project, actionTypes.create)}
      >
        <div className={styles.subTitle}>
          <div>{'支持管理 OceanBase 、 MySQL 等数据源；'}</div>
          <div>{'可将数据源下的数据库添加到对应的项目内，供团队协同开发使用'}</div>
        </div>
      </Acess>
    );
  };
  return (
    <Result
      status={'success'}
      title={<div className={styles.title}>暂无数据源</div>}
      subTitle={renderSubTitle()}
      icon={
        <img
          src={window.publicPath + 'img/graphic_empty.svg'}
          style={{ height: 102, width: 132 }}
        />
      }
      extra={[
        <Acess
          fallback={<></>}
          {...createPermission(IManagerResourceType.project, actionTypes.create)}
        >
          <TitleButton onReload={() => paramContext.reloadTable()} key="titleButton" />
        </Acess>,
      ]}
    />
  );
}