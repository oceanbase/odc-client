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
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import type { IFunction } from '@/d.ts';
import type { PageStore } from '@/store/page';
import type { SQLStore } from '@/store/sql';
import {
  AlignLeftOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FileSearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { Layout, message, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

import { getDataSourceModeConfig } from '@/common/datasource';
import { getFunctionByFuncName } from '@/common/network';
import { IEditor } from '@/component/MonacoEditor';
import { SQLCodePreviewer } from '@/component/SQLCodePreviewer';
import { PLType } from '@/constant/plType';
import { openFunctionEditPageByFuncName } from '@/store/helper/page';
import { FunctionPage as FunctionPageModel } from '@/store/helper/page/pages';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { isConnectionModeBeMySQLType } from '@/util/connection';
import { parseDataType } from '@/util/dataType';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import EditableTable from '../EditableTable';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import ShowFunctionBaseInfoForm from '../ShowFunctionBaseInfoForm';
import styles from './index.less';

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
  params: FunctionPageModel['pageParams'];

  onUnsavedChange: (pageKey: string) => void;
}

@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
class FunctionPage extends Component<
  IProps & { session: SessionStore },
  {
    propsTab: PropsTab;
    func: Partial<IFunction>;
    dataLoading: boolean;
    formated: boolean;
  }
> {
  public editor: IEditor;

  public gridRef: React.RefObject<DataGridRef> = React.createRef();

  public readonly state = {
    propsTab: this.props.params.propsTab || PropsTab.INFO,
    func: null,
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
    const { func } = this.state;
    this.setState({ propsTab });

    // 更新 url
    pageStore.updatePage(pageKey, undefined, {
      path: true,
      funName: func.funName,
      topTab: TopTab.PROPS,
      propsTab,
    });
  };

  public reloadFunction = async (funName: string) => {
    const { session, params } = this.props;
    const func: IFunction = await getFunctionByFuncName(
      funName,
      false,
      session?.sessionId,
      session?.database?.dbName,
    );
    if (func) {
      func.params = func.params.map((param) => {
        const { dataType, dataLength } = parseDataType(param.dataType);
        return {
          ...param,
          dataType,
          dataLength,
        };
      });
      this.setState({ func });
    } else {
      message.error(formatMessage({ id: 'workspace.window.function.load.error' }));
    }
  };

  public async componentDidMount() {
    const {
      params: { funName },
    } = this.props;

    await this.reloadFunction(funName);
  }

  public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<Record<string, any>>) {
    const { func } = this.state;
    if (prevState.func?.params !== func?.params) {
      this.gridRef.current?.setRows?.(func?.params ?? []);
    }
  }

  public async editFunction(funName: string) {
    const { params, session } = this.props;
    await openFunctionEditPageByFuncName(
      funName,
      session?.sessionId,
      session?.database?.dbName,
      session?.odcDatabase?.id,
    );
  }

  private showSearchWidget() {
    const codeEditor = this.editor;
    codeEditor.trigger('FIND_OR_REPLACE', 'actions.find', null);
  }

  private handleFormat = () => {
    const { formated, func } = this.state;
    if (!formated) {
      this.editor.doFormat();
    } else {
      this.editor.setValue(func?.ddl || '');
    }
    this.setState({
      formated: !formated,
    });
  };

  public render() {
    const {
      session,
      params: { funName },
    } = this.props;
    const { propsTab, func, formated } = this.state;
    const isMySQL = isConnectionModeBeMySQLType(session?.connection?.dialectType);

    const tableColumns = [
      {
        key: 'paramName',
        name: formatMessage({
          id: 'workspace.window.createFunction.paramName',
        }),

        width: isMySQL ? undefined : 150,
        sortable: false,
      },

      {
        key: 'paramMode',
        name: formatMessage({
          id: 'workspace.window.createFunction.paramMode',
        }),

        width: isMySQL ? 150 : 100,
        sortable: false,
      },

      {
        key: 'dataType',
        name: formatMessage({ id: 'workspace.window.createFunction.dataType' }),
        sortable: false,
        width: isMySQL ? 160 : 120,
      },

      isMySQL
        ? {
            key: 'dataLength',
            name: formatMessage({ id: 'odc.components.FunctionPage.Length' }), // 长度
            sortable: false,
            width: 100,
          }
        : null,

      isMySQL
        ? null
        : {
            key: 'defaultValue',
            name: formatMessage({
              id: 'workspace.window.createFunction.defaultValue',
            }),

            sortable: false,
          },
    ].filter(Boolean);

    return (
      func && (
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
                  children: <ShowFunctionBaseInfoForm model={func} />,
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
                          onClick={this.reloadFunction.bind(this, func.funName)}
                        />
                      </Toolbar>
                      <EditableTable
                        gridRef={this.gridRef}
                        minHeight={'calc(100% - 38px)'}
                        rowKey="paramName"
                        initialColumns={tableColumns}
                        initialRows={func.params || []}
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
                        {getDataSourceModeConfig(session?.connection?.type)?.features?.plEdit && (
                          <ToolbarButton
                            text={formatMessage({ id: 'workspace.window.session.button.edit' })}
                            icon={<EditOutlined />}
                            onClick={this.editFunction.bind(this, func.funName)}
                          />
                        )}

                        <ToolbarButton
                          text={
                            formatMessage({
                              id: 'odc.components.FunctionPage.Download',
                            }) //下载
                          }
                          icon={<CloudDownloadOutlined />}
                          onClick={() => {
                            downloadPLDDL(
                              funName,
                              PLType.FUNCTION,
                              func?.ddl,
                              session?.database?.dbName,
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
                                  id: 'odc.components.FunctionPage.Unformat',
                                })
                              : // 取消格式化
                                formatMessage({
                                  id: 'odc.components.FunctionPage.Formatting',
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
                          onClick={this.reloadFunction.bind(this, func.funName)}
                        />
                      </Toolbar>
                      <div style={{ height: `calc(100% - 38px)`, position: 'relative' }}>
                        <SQLCodePreviewer
                          readOnly
                          defaultValue={(func && func.ddl) || ''}
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
          return <FunctionPage {...props} session={session} />;
        }}
      </SessionContext.Consumer>
    );
  },
  true,
  true,
);
