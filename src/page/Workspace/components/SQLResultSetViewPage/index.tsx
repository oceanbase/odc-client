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

import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import CommonIDE from '@/component/CommonIDE';
import { TAB_HEADER_HEIGHT, WORKSPACE_HEADER_HEIGHT } from '@/constant';
import { ConnectionMode } from '@/d.ts';
import { generateResultSetColumns } from '@/store/helper';
import { SQLResultSetPage } from '@/store/helper/page/pages';
import React from 'react';

interface IProps {
  params: SQLResultSetPage['pageParams'];
}

const SQLResultSetViewPage: React.FC<IProps> = (props) => {
  const otherHeight = WORKSPACE_HEADER_HEIGHT + TAB_HEADER_HEIGHT;
  const config = getDataSourceModeConfigByConnectionMode(ConnectionMode.MYSQL);
  return (
    <div
      style={{
        height: `calc(100vh - ${otherHeight}px)`,
        background: '#ffffff',
      }}
    >
      <CommonIDE
        session={null}
        language={config?.sql?.language}
        initialSQL={props.params?.sqlContent}
        editorProps={{
          readOnly: true,
        }}
        toolbarGroupKey="EMPTY"
        resultSets={generateResultSetColumns(props.params?.resultSets, ConnectionMode.OB_ORACLE)}
        showLog={false}
      />
    </div>
  );
};

export default SQLResultSetViewPage;
