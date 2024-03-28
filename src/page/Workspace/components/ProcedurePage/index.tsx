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

import Toolbar from '@/component/Toolbar';
import type { IProcedure } from '@/d.ts';
import { ConnectionMode } from '@/d.ts';
import type { PageStore } from '@/store/page';
import type { SQLStore } from '@/store/sql';
import {
  AlignLeftOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FileSearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Layout, message, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';

// @ts-ignore
import { getProcedureByProName } from '@/common/network';
import { IEditor } from '@/component/MonacoEditor';
import { SQLCodePreviewer } from '@/component/SQLCodePreviewer';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { PLType } from '@/constant/plType';
import { openProcedureEditPageByProName, updatePage } from '@/store/helper/page';
import { ProcedurePage as ProcedurePageModel } from '@/store/helper/page/pages';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { parseDataType } from '@/util/dataType';
import { downloadPLDDL } from '@/util/sqlExport';
import EditableTable from '../EditableTable';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import ShowProcedureBaseInfoForm from '../ShowProcedureBaseInfoForm';
import styles from './index.less';
import { isConnectionModeBeMySQLType } from '@/util/connection';
import { getDataSourceModeConfig } from '@/common/datasource';
import { formatMessage } from '@/util/intl';

const ToolbarButton = Toolbar.Button;

const { Content } = Layout;

// 顶层 Tab key 枚举
export enum TopTab {
  PROPS = 'PROPS',
}

// 属性 Tab key 枚举
export enum PropsTab {
  INFO = 'INFO',
  PARAMS = 'PARAMS',
  DDL = 'DDL',
}

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  params: ProcedurePageModel['pageParams'];

  onUnsavedChange: (pageKey: string) => void;
}

@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
class ProcedurePage extends Component<
  IProps & { session: SessionStore },
  {
    propsTab: PropsTab;
    procedure: Partial<IProcedure>;
    dataLoading: boolean;
    formated: boolean;
  }
> {
  public editor: IEditor;

  public gridRef: React.RefObject<DataGridRef> = React.createRef();

  public readonly state = {
    propsTab: this.props.params.propsTab || PropsTab.INFO,
    procedure: null,
    dataLoading: false,
    formated: false,
  };

  public UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    if (
      nextProps.params &&
      this.props.params &&
      this.props.params.propsTab &&
      nextProps.params.propsTab !== this.state.propsTab
    ) {
      this.setState({
        propsTab: nextProps.params.propsTab,
      });
    }
  }

  public handlePropsTabChanged = (propsTab: PropsTab) => {
    const { pageStore, pageKey } = this.props;
    const { procedure } = this.state;
    this.setState({ propsTab });
    updatePage(pageKey, {
      path: true,
      proName: procedure.proName,
      topTab: TopTab.PROPS,
      propsTab,
    });
  };

  public reloadProcedure = async (proName: string) => {
    const { session, params } = this.props;
    const procedure = await getProcedureByProName(
      proName,
      false,
      session?.sessionId,
      session?.odcDatabase.name,
    );
    if (procedure) {
      procedure.params = procedure.params.map((param) => {
        const { dataType, dataLength } = parseDataType(param.dataType);
        return {
          ...param,
          dataType,
          dataLength,
        };
      });
      this.setState({ procedure });
    } else {
      message.error(formatMessage({ id: 'workspace.window.procedure.load.error' }));
    }
  };

  public async componentDidMount() {
    const {
      params: { proName },
    } = this.props;

    await this.reloadProcedure(proName);
  }

  public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<Record<string, any>>) {
    const { procedure } = this.state;
    if (prevState.procedure?.params !== procedure?.params) {
      this.gridRef.current?.setRows?.(procedure?.params ?? []);
    }
  }

  public async editProcedure(proName: string) {
    const { params, sessionManagerStore, session } = this.props;
    await openProcedureEditPageByProName(
      proName,
      session?.sessionId,
      session?.odcDatabase.name,
      session?.odcDatabase?.id,
    );
  }

  private showSearchWidget() {
    const codeEditor = this.editor;
    codeEditor.trigger('FIND_OR_REPLACE', 'actions.find', null);
  }

  private handleFormat = () => {
    const { formated, procedure } = this.state;
    if (!formated) {
      this.editor.doFormat();
    } else {
      this.editor.setValue(procedure?.ddl || '');
    }
    this.setState({
      formated: !formated,
    });
  };

  public render() {
    const {
      pageKey,
      params: { proName },
      session,
      sessionManagerStore,
    } = this.props;
    const { propsTab, procedure, formated } = this.state;
    const isMySQL = isConnectionModeBeMySQLType(session?.connection.dialectType);

    const tableColumns = [
      {
        key: 'paramName',
        name: formatMessage({
          id: 'workspace.window.createFunction.paramName',
        }),

        width: 150,
        sortable: false,
      },

      {
        key: 'paramMode',
        name: formatMessage({
          id: 'workspace.window.createFunction.paramMode',
        }),

        width: 100,
        sortable: false,
      },

      {
        key: 'dataType',
        name: formatMessage({ id: 'workspace.window.createFunction.dataType' }),
        sortable: false,
        width: 140,
      },

      isMySQL
        ? {
            key: 'dataLength',
            name: formatMessage({ id: 'odc.components.ProcedurePage.Length' }), // 长度
            sortable: false,
            width: 100,
          }
        : null,

      {
        key: 'defaultValue',
        name: formatMessage({
          id: 'workspace.window.createFunction.defaultValue',
        }),

        sortable: false,
      },
    ].filter(Boolean);

    return (
      procedure && (
        <>
          <Content style={{ height: '100%' }}>
            <Tabs
              activeKey={propsTab}
              tabPosition="left"
              className={styles.propsTab}
              onChange={this.handlePropsTabChanged as any}
              items={[
                {
                  key: PropsTab.INFO,
                  label: formatMessage({
                    id: 'workspace.window.table.propstab.info',
                  }),
                  children: <ShowProcedureBaseInfoForm model={procedure} />,
                },
                {
                  key: PropsTab.PARAMS,
                  label: formatMessage({
                    id: 'workspace.window.function.propstab.params',
                  }),
                  children: (
                    <>
                      <Toolbar>
                        <ToolbarButton
                          text={formatMessage({ id: 'workspace.window.session.button.refresh' })}
                          icon={<SyncOutlined />}
                          onClick={this.reloadProcedure.bind(this, procedure.proName)}
                        />
                      </Toolbar>
                      <EditableTable
                        gridRef={this.gridRef}
                        minHeight={'calc(100% - 38px)'}
                        rowKey="paramName"
                        initialColumns={tableColumns}
                        initialRows={procedure.params || []}
                        bordered={false}
                        readonly={true}
                      />
                    </>
                  ),
                },
                {
                  key: PropsTab.DDL,
                  label: 'DDL',
                  children: (
                    <>
                      <Toolbar>
                        <ToolbarButton
                          disabled={
                            !getDataSourceModeConfig(session?.connection?.type)?.features?.plEdit
                          }
                          text={formatMessage({ id: 'workspace.window.session.button.edit' })}
                          icon={<EditOutlined />}
                          onClick={this.editProcedure.bind(this, procedure.proName)}
                        />
                        <ToolbarButton
                          text={
                            formatMessage({
                              id: 'odc.components.ProcedurePage.Download',
                            }) //下载
                          }
                          icon={<CloudDownloadOutlined />}
                          onClick={() => {
                            downloadPLDDL(
                              proName,
                              PLType.PROCEDURE,
                              procedure?.ddl,
                              session?.odcDatabase.name,
                            );
                          }}
                        />

                        <ToolbarButton
                          text={formatMessage({ id: 'workspace.window.sql.button.search' })}
                          icon={<FileSearchOutlined />}
                          onClick={this.showSearchWidget.bind(this)}
                        />

                        <ToolbarButton
                          text={
                            formated
                              ? formatMessage({
                                  id: 'odc.components.ProcedurePage.Unformat',
                                })
                              : // 取消格式化
                                formatMessage({
                                  id: 'odc.components.ProcedurePage.Formatting',
                                })

                            // 格式化
                          }
                          icon={<AlignLeftOutlined />}
                          onClick={this.handleFormat}
                          status={formated ? IConStatus.ACTIVE : IConStatus.INIT}
                        />

                        <ToolbarButton
                          text={formatMessage({ id: 'workspace.window.session.button.refresh' })}
                          icon={<SyncOutlined />}
                          onClick={this.reloadProcedure.bind(this, procedure.proName)}
                        />
                      </Toolbar>
                      <div style={{ height: `calc(100% - 38px)`, position: 'relative' }}>
                        <SQLCodePreviewer
                          readOnly
                          defaultValue={(procedure && procedure.ddl) || ''}
                          language={
                            getDataSourceModeConfig(session?.connection?.type)?.sql?.language
                          }
                          onEditorCreated={(editor: IEditor) => {
                            this.editor = editor;
                          }}
                        />
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </Content>
        </>
      )
    );
  }
}

export default WrapSessionPage(
  function Component(props: IProps) {
    return (
      <SessionContext.Consumer>
        {({ session }) => {
          return <ProcedurePage {...props} session={session} />;
        }}
      </SessionContext.Consumer>
    );
  },
  true,
  true,
);
