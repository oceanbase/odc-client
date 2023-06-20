import CommonIDE from '@/component/CommonIDE';
import { TAB_HEADER_HEIGHT, WORKSPACE_HEADER_HEIGHT } from '@/constant';
import { ConnectionMode } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SQLResultSetPage } from '@/store/helper/page/pages';
import { inject, observer } from 'mobx-react';
import React from 'react';

interface IProps {
  connectionStore?: ConnectionStore;
  params: SQLResultSetPage['pageParams'];
}

const SQLResultSetViewPage: React.FC<IProps> = (props) => {
  const isMySQL = props.connectionStore.connection.dialectType === ConnectionMode.OB_MYSQL;
  const otherHeight = WORKSPACE_HEADER_HEIGHT + TAB_HEADER_HEIGHT;
  return (
    <div
      style={{
        height: `calc(100vh - ${otherHeight}px)`,
        background: '#ffffff',
      }}
    >
      <CommonIDE
        session={null}
        language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
        initialSQL={props.params?.resultSets
          ?.map((r) => {
            return r.originSql;
          })
          .join('\r\n')}
        editorProps={{
          readOnly: true,
        }}
        toolbarGroupKey="EMPTY"
        resultSets={props.params?.resultSets}
      />
    </div>
  );
};

export default inject('connectionStore')(observer(SQLResultSetViewPage));
