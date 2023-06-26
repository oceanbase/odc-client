import { ConnectionPropertyType } from '@/d.ts/datasource';
import { formatMessage } from '@/util/intl';
import { Drawer } from 'antd';
import React from 'react';
import SessionParamsTable from './SessionParamsTable';

interface IProps {
  visible: boolean;
  sessionId: string;
  onClose: () => void;
}

const SessionParamDrawer: React.FC<IProps> = function ({ visible, sessionId, onClose }) {
  return (
    <Drawer
      title={
        formatMessage({
          id: 'odc.components.SessionParamPage.SessionParamDrawer.SessionVariables',
        }) //会话变量
      }
      open={visible}
      onClose={() => {
        onClose();
      }}
      width={520}
    >
      <SessionParamsTable
        bordered
        sessionId={sessionId}
        connectionPropertyType={ConnectionPropertyType.SESSION}
      />
    </Drawer>
  );
};

export default SessionParamDrawer;
