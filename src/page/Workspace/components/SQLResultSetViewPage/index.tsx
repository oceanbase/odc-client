import CommonIDE from '@/component/CommonIDE';
import { TAB_HEADER_HEIGHT, WORKSPACE_HEADER_HEIGHT } from '@/constant';
import { ConnectionMode, IResultSet } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { inject, observer } from 'mobx-react';
import React from 'react';

interface IProps {
  connectionStore?: ConnectionStore;
  params: {
    resultSets: IResultSet[];
  };
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
        language={`sql-oceanbase-${isMySQL ? 'mysql' : 'oracle'}`}
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
