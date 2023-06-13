import { PropsWithChildren } from 'react';
import SessionContextWrap from '..';
import SessionSelect from '../SessionSelect';

import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import styles from './index.less';

interface IProps extends PropsWithChildren<any> {
  databaseId: number;
  databaseFrom: 'project' | 'datasource';
  noSessionSelect?: boolean;
}

export function SessionPage({ children, databaseId, databaseFrom, noSessionSelect }: IProps) {
  return (
    <SessionContextWrap defaultDatabaseId={databaseId} defaultMode={databaseFrom || 'datasource'}>
      {({ session }) => {
        return (
          <div className={styles.sessionWrap}>
            {!noSessionSelect && <SessionSelect />}
            <div key={session?.sessionId} className={styles.content}>
              {!session ? <WorkSpacePageLoading /> : children}
            </div>
          </div>
        );
      }}
    </SessionContextWrap>
  );
}

export default function WrapSessionPage(Component, noSessionSelect?: boolean) {
  return function WrapComponent(props) {
    return (
      <SessionPage
        databaseFrom={props?.params?.databaseFrom}
        databaseId={props?.params?.databaseId}
        noSessionSelect={noSessionSelect}
      >
        <Component {...props} />
      </SessionPage>
    );
  };
}
