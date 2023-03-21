import React from 'react';
import Sider from './Sider';

import { useParams } from 'umi';
import Connection from './Connecion';
import History from './History';
import styles from './index.less';
import Task from './Task';
import { IPageType } from './type';

interface IProps {}

const Pages = {
  [IPageType.Connection]: {
    component: Connection,
  },
  [IPageType.History]: {
    component: History,
  },
  [IPageType.Task]: {
    component: Task,
  },
};

const Index: React.FC<IProps> = function () {
  const pageKey = useParams<{ page: IPageType }>()?.page;
  const Component = Pages[pageKey].component;
  return (
    <div className={styles.index}>
      <Sider />
      <div className={styles.content}>{Component ? <Component /> : ''}</div>
    </div>
  );
};

export default Index;
