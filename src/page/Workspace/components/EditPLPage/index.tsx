import { executeSQL } from '@/common/network/sql';
import MonacoEditor, { IEditor } from '@/component/MonacoEditor';
import Toolbar from '@/component/Toolbar';
import { ConnectionMode, ISqlExecuteResultStatus } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { SQLStore } from '@/store/sql';
import notification from '@/util/notification';
import { AlignLeftOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { formatMessage, FormattedMessage } from 'umi';
import styles from './index.less';

const ToolbarButton = Toolbar.Button;

@inject('sqlStore', 'schemaStore', 'pageStore', 'connectionStore')
@observer
export default class EditPLPage extends Component<
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
    sql: '',
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
        message.success(
          formatMessage({
            id: 'odc.components.EditPLPage.ModifiedSuccessfully',
          }),
        );

        // 关闭当前新建页面
        pageStore!.close(pageKey);

        // 刷新视图资源树
        // await schemaStore!.getPackageList();
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
        <Toolbar>
          <ToolbarButton
            text={<FormattedMessage id="workspace.window.sql.button.format" />}
            icon={<AlignLeftOutlined />}
            onClick={this.handleFormat}
          />
        </Toolbar>
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
