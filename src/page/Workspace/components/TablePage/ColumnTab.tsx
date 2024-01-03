/*
 * Copyright 2024 OceanBase
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

import { ITable } from '@/d.ts';
import { PageStore } from '@/store/page';
import { SQLStore } from '@/store/sql';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import CreateTableColumnForm from '../CreateTableColumnForm';

@inject('sqlStore', 'pageStore')
@observer
export default class ColumnTab extends Component<
  {
    hideRawtableInfo?: boolean;
    hideOrder?: boolean;
    editable: boolean;
    modified: boolean;
    sqlStore?: SQLStore;
    pageStore?: PageStore;
    table: Partial<ITable>;
    tableName: string;
    pageKey: string;
    onReload: () => void;
  },
  {}
> {
  public render() {
    const { onReload, table, modified } = this.props;

    return (
      <>
        <CreateTableColumnForm
          hideBorder={true}
          fixedFooter={true}
          modified={modified}
          allowRefresh={true}
          allowReset={true}
          tableHeight="calc(100vh - 153px)"
          columns={(table && table.columns) || []}
          onRefresh={onReload}
        />
      </>
    );
  }
}
