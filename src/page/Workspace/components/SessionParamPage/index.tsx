import { ConnectionPropertyType } from '@/store/connection';

import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import { SessionParamsPage } from '@/store/helper/page/pages';
import { Layout } from 'antd';
import SessionContextWrap from '../SessionContextWrap';
import SessionParamsTable from './SessionParamsTable';
const { Content } = Layout;

interface IProps {
  params: SessionParamsPage['pageParams'];
}

function SessionParam({ sessionId }: { sessionId: string }) {
  return (
    <>
      <Content
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <SessionParamsTable
            showDatasource
            tip={null}
            sessionId={sessionId}
            connectionPropertyType={ConnectionPropertyType.GLOBAL}
          />
        </div>
      </Content>
    </>
  );
}

export default function SessionParamPage(props: Omit<IProps, 'sessionId'>) {
  return (
    <SessionContextWrap
      defaultDatabaseId={null}
      defaultDatasourceId={props.params?.cid}
      datasourceMode
    >
      {({ session }) => {
        return session ? (
          <SessionParam {...props} sessionId={session?.sessionId} />
        ) : (
          <WorkSpacePageLoading />
        );
      }}
    </SessionContextWrap>
  );
}
