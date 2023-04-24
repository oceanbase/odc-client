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
