import EditorToolBar from '@/component/EditorToolBar';
import { ConnectionMode, ISqlExecuteResultStatus } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { SQLStore } from '@/store/sql';
import { Button, message } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { FormattedMessage } from 'umi';

import { executeSQL } from '@/common/network/sql';
import MonacoEditor, { IEditor } from '@/component/MonacoEditor';
import notification from '@/util/notification';
import styles from './index.less';

@inject('sqlStore', 'schemaStore', 'pageStore', 'connectionStore')
@observer
export default class CreatePackage extends Component<
  {
    params: {
      sql: string;
      textCreateSuccess?: string;
    };
    sqlStore: SQLStore;
    schemaStore: SchemaStore;
    pageStore: PageStore;
    connectionStore: ConnectionStore;
    pageKey: string;
    onUnsavedChange: (pageKey: string) => void;
  },
  {
    sql: string;
  }
> {
  public readonly state = {
    sql: this.props.params.sql,
  };

  public editor: IEditor;

  public handleSQLChanged = (sql: string) => {
    this.setState({ sql });
  };

  // 格式化
  public handleFormat = () => {
    this.editor.doFormat();
  };

  public handleSubmit = async () => {
    const {
      pageStore,
      sqlStore,
      schemaStore,
      pageKey,
      params: { textCreateSuccess },
    } = this.props;
    try {
      const data = await executeSQL({ sql: this.state.sql, split: false });
      if (data?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
        message.success(textCreateSuccess);

        // 关闭当前新建页面
        pageStore!.close(pageKey);

        // 刷新视图资源树
        await schemaStore!.getPackageList();
      } else {
        notification.error(data?.[0]);
      }
    } catch (e) {
      //
    }
  };

  public render() {
    const {
      params: { sql },
      connectionStore,
    } = this.props;
    const isMySQL = connectionStore.connection.dbMode === ConnectionMode.OB_MYSQL;

    return (
      <>
        <EditorToolBar loading={false} ctx={this} actionGroupKey="PL_CREATE_ACTION_GROUP" />
        <div style={{ height: `calc(100vh - ${40 + 28 + 50 + 40}px)`, position: 'relative' }}>
          <MonacoEditor
            defaultValue={sql}
            language={isMySQL ? 'obmysql' : 'oboracle'}
            onValueChange={this.handleSQLChanged}
            onEditorCreated={(editor: IEditor) => {
              this.editor = editor;
            }}
          />
        </div>
        <div className={styles.footer}>
          <Button size="small" className={styles.button} type="primary" onClick={this.handleSubmit}>
            <FormattedMessage id="app.button.save" />
          </Button>
        </div>
      </>
    );
  }
}
