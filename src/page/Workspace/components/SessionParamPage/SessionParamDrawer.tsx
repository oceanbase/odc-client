/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
          defaultMessage: '会话变量',
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
