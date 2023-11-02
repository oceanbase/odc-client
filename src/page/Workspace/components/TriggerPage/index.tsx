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

import { getTriggerByName } from '@/common/network/trigger';
import { IEditor } from '@/component/MonacoEditor';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { PLType } from '@/constant/plType';
import type { ITrigger } from '@/d.ts';
import { ConnectionMode, TriggerPropsTab as PropsTab, TriggerState } from '@/d.ts';
import { openTriggerEditPageByName } from '@/store/helper/page';
import { TriggerPage as TriggerPageModel } from '@/store/helper/page/pages';
import type { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import {
  AlignLeftOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FileSearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Layout, message, Modal, Radio, Tabs } from 'antd';
import type { RadioChangeEvent } from 'antd/lib/radio';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import ToolContentWrpper from '../ToolContentWrapper';
import ToolPageTabs from '../ToolPageTabs';
import ToolPageTextFromWrapper from '../ToolPageTextFormWrapper';
import styles from './index.less';
import { getDataSourceModeConfig } from '@/common/datasource';

const { Content } = Layout;
const { TabPane } = Tabs;
const ToolbarButton = Toolbar.Button;
const tableColumns = [
  {
    key: 'name',
    name: formatMessage({ id: 'odc.components.TriggerPage.Name' }), // 名称
    resizable: true,
    sortable: false,
  },

  {
    key: 'owner',
    name: formatMessage({ id: 'odc.components.TriggerPage.Owner' }), // 所有者
    resizable: true,
    sortable: false,
  },

  {
    key: 'type',
    name: formatMessage({ id: 'odc.components.TriggerPage.Type' }), // 类型
    resizable: true,
    sortable: false,
  },

  {
    key: 'status',
    name: formatMessage({ id: 'odc.components.TriggerPage.State' }), // 状态
    resizable: true,
    sortable: false,
  },
];

// 属性 Tab key 枚举

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  session: SessionStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  params: TriggerPageModel['pageParams'];

  onUnsavedChange: (pageKey: string) => void;
}

@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
class TriggerPage extends Component<
  IProps,
  {
    propsTab: PropsTab;
    trigger: Partial<ITrigger>;
    isEditStatus: boolean;
    hasChanged: boolean;
    formated: boolean;
  }
> {
  private editor: IEditor;
  public readonly state = {
    propsTab: this.props.params.propsTab || PropsTab.DDL,
    trigger: {
      triggerName: '',
      owner: '',
      enableState: TriggerState.disabled,
      tableName: '',
      tableOwner: '',
      baseObjectType: '',
      status: null,
      correlation: [],
      ddl: '',
    },

    isEditStatus: false,
    hasChanged: false,
    formated: false,
  };

  public async componentDidMount() {
    const {
      params: { triggerData },
    } = this.props;
    if (triggerData) {
      this.setState({
        trigger: triggerData,
      });
    } else {
      await this.reloadTrigger();
    }
  }

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

  private handlePropsTabChanged = (propsTab: PropsTab) => {
    const { hasChanged } = this.state;

    if (hasChanged) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.TriggerPage.AreYouSureYouWant',
        }),

        // 确认保存当前编辑的内容吗？
        centered: true,
        onCancel: () => {
          // 丢弃编辑内容，继续tab切换
          this.handleCloseBaseInfo(() => {
            this.handleSwitchTab(propsTab);
          });
        },
        onOk: () => {
          // 保存编辑内容，并切换tab
          this.handleConfirmBaseInfo(() => {
            this.handleSwitchTab(propsTab);
          });
        },
      });
    } else {
      this.handleSwitchTab(propsTab);
    }
  };
  private handleSwitchTab = (propsTab: PropsTab) => {
    const { pageStore, pageKey } = this.props;
    const { trigger } = this.state;
    this.setState({
      propsTab,
    });

    // 更新 url

    pageStore.updatePage(
      pageKey,
      {},

      {
        triggerName: trigger.triggerName,
        propsTab,
      },
    );
  };
  private handleCloseBaseInfo = (callback?: () => void) => {
    this.setState({
      isEditStatus: false,
      hasChanged: false,
    });

    if (typeof callback === 'function') {
      callback();
    }
  };
  private reloadTrigger = async () => {
    const {
      params: { triggerName },
      session,
    } = this.props;
    const trigger = await getTriggerByName(
      triggerName,
      session?.sessionId,
      session?.odcDatabase?.name,
    );
    if (trigger) {
      this.setState({
        trigger,
      });
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.TriggerPage.FailedToLoadTheTrigger',
        }),

        // 加载触发器失败
      );
    }
  };
  private editTrigger = () => {
    const {
      params: { triggerName },
      session,
    } = this.props;
    openTriggerEditPageByName(
      triggerName,
      session?.sessionId,
      session?.odcDatabase?.name,
      session?.odcDatabase?.id,
    );
  };
  private showSearchWidget = () => {
    const codeEditor = this.editor;
    codeEditor.trigger('FIND_OR_REPLACE', 'actions.find', null);
  };
  private handleEditBaseInfo = () => {
    this.setState({
      isEditStatus: true,
    });
  };
  private handleConfirmBaseInfo = (callback?: () => void) => {
    const {
      trigger: { triggerName, enableState },
    } = this.state;
    const { session, params } = this.props;
    session?.database.getTriggerList();
    this.props.pageStore.updatePageColor(triggerName, enableState === TriggerState.disabled);
    this.handleCloseBaseInfo(callback);
  };
  private handleCancelBaseInfo = () => {
    this.handleCloseBaseInfo();
  };
  private handleStatusChange = (e: RadioChangeEvent) => {
    const { trigger } = this.state;
    this.setState({
      hasChanged: true,
      trigger: { ...trigger, enableState: e.target.value },
    });
  };

  private handleFormat = () => {
    const { formated, trigger } = this.state;
    if (!formated) {
      this.editor.doFormat();
    } else {
      this.editor.setValue(trigger?.ddl || '');
    }
    this.setState({
      formated: !formated,
    });
  };

  public render() {
    const { sessionManagerStore, session } = this.props;
    const { propsTab, trigger, isEditStatus, formated } = this.state;
    const preTextForm = 'odc-toolPage-textFrom';

    if (!trigger || !trigger.triggerName) {
      return null;
    }

    return (
      trigger && (
        <>
          <Content className={styles.triggerPage}>
            <ToolPageTabs activeKey={propsTab} onChange={this.handlePropsTabChanged as any}>
              <TabPane
                tab={formatMessage({
                  id: 'odc.components.TriggerPage.BasicInformation',
                })}
                /* 基本信息 */
                key={PropsTab.BASE_INFO}
              >
                {session?.supportFeature?.enableTriggerAlterStatus && (
                  <Toolbar>
                    {isEditStatus ? (
                      <div className={styles.toolbarCustomize}>
                        <div className={styles.title}>
                          {
                            formatMessage({
                              id: 'odc.components.TriggerPage.Editing',
                            })

                            /* 编辑 */
                          }
                        </div>
                        <div className={styles.operator}>
                          <Button size="small" onClick={this.handleCancelBaseInfo}>
                            {
                              formatMessage({
                                id: 'odc.components.TriggerPage.Cancel',
                              })

                              /* 取消 */
                            }
                          </Button>
                          <Button
                            size="small"
                            className={styles.spaceLeft}
                            type="primary"
                            onClick={() => {
                              this.handleConfirmBaseInfo();
                            }}
                          >
                            {
                              formatMessage({
                                id: 'odc.components.TriggerPage.Determine',
                              })

                              /* 确定 */
                            }
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ToolbarButton
                          text={formatMessage({
                            id: 'workspace.window.session.button.edit',
                          })}
                          icon={<EditOutlined />}
                          onClick={this.handleEditBaseInfo}
                        />

                        <ToolbarButton
                          text={formatMessage({
                            id: 'workspace.window.session.button.refresh',
                          })}
                          icon={<SyncOutlined />}
                          onClick={this.reloadTrigger}
                        />
                      </>
                    )}
                  </Toolbar>
                )}

                <ToolContentWrpper>
                  <ToolPageTextFromWrapper>
                    <div className={`${preTextForm}-line`}>
                      <span className={`${preTextForm}-label`}>
                        {
                          formatMessage({
                            id: 'odc.components.TriggerPage.Name.2',
                          })

                          /* 名称: */
                        }
                      </span>
                      <span className={`${preTextForm}-content`}>{trigger.triggerName}</span>
                    </div>
                    <div className={`${preTextForm}-line`}>
                      <span className={`${preTextForm}-label`}>
                        {
                          formatMessage({
                            id: 'odc.components.TriggerPage.Owner.2',
                          })

                          /* 所有者: */
                        }
                      </span>
                      <span className={`${preTextForm}-content`}>{trigger.owner}</span>
                    </div>
                    {isEditStatus ? (
                      <Radio.Group
                        defaultValue={trigger.enableState}
                        onChange={this.handleStatusChange}
                      >
                        <Radio value={TriggerState.enabled}>
                          {
                            formatMessage({
                              id: 'odc.components.TriggerPage.Enable',
                            })

                            /* 启用 */
                          }
                        </Radio>
                        <Radio value={TriggerState.disabled}>
                          {
                            formatMessage({
                              id: 'odc.components.TriggerPage.Disable',
                            })

                            /* 禁用 */
                          }
                        </Radio>
                      </Radio.Group>
                    ) : (
                      <div className={`${preTextForm}-line`}>
                        <span className={`${preTextForm}-label`}>
                          {
                            formatMessage({
                              id: 'odc.components.TriggerPage.WhetherToEnable',
                            })

                            /* 是否启用: */
                          }
                        </span>
                        <span className={`${preTextForm}-content`}>
                          {
                            trigger.enableState === TriggerState.enabled
                              ? formatMessage({
                                  id: 'odc.components.TriggerPage.Enable',
                                })
                              : // 启用
                                formatMessage({
                                  id: 'odc.components.TriggerPage.Disable',
                                })

                            // 禁用
                          }
                        </span>
                      </div>
                    )}
                  </ToolPageTextFromWrapper>
                </ToolContentWrpper>
              </TabPane>
              <TabPane
                tab={formatMessage({
                  id: 'odc.components.TriggerPage.ReferenceObject',
                })}
                /* 基准对象 */
                key={PropsTab.BASE_OBJECT}
              >
                <Toolbar>
                  <ToolbarButton
                    text={formatMessage({
                      id: 'workspace.window.session.button.refresh',
                    })}
                    icon={<SyncOutlined />}
                    onClick={this.reloadTrigger}
                  />
                </Toolbar>
                <ToolContentWrpper>
                  <ToolPageTextFromWrapper>
                    <div className={`${preTextForm}-line`}>
                      <span className={`${preTextForm}-label`}>
                        {
                          formatMessage({
                            id: 'odc.components.TriggerPage.Name.2',
                          })

                          /* 名称: */
                        }
                      </span>
                      <span className={`${preTextForm}-content`}>{trigger.tableName}</span>
                    </div>
                    <div className={`${preTextForm}-line`}>
                      <span className={`${preTextForm}-label`}>
                        {
                          formatMessage({
                            id: 'odc.components.TriggerPage.Owner.2',
                          })

                          /* 所有者: */
                        }
                      </span>
                      <span className={`${preTextForm}-content`}>{trigger.tableOwner}</span>
                    </div>
                    <div className={`${preTextForm}-line`}>
                      <span className={`${preTextForm}-label`}>
                        {
                          formatMessage({
                            id: 'odc.components.TriggerPage.Type.1',
                          })

                          /* 类型: */
                        }
                      </span>
                      <span className={`${preTextForm}-content`}>{trigger.baseObjectType}</span>
                    </div>
                    {trigger.status && (
                      <div className={`${preTextForm}-line`}>
                        <span className={`${preTextForm}-label`}>
                          {
                            formatMessage({
                              id: 'odc.components.TriggerPage.Status',
                            })

                            /* 状态: */
                          }
                        </span>
                        <span className={`${preTextForm}-content`}>{trigger.status}</span>
                      </div>
                    )}
                  </ToolPageTextFromWrapper>
                </ToolContentWrpper>
              </TabPane>
              {/**
              * 本期（2.4.0）不支持该功能
              <TabPane
              tab="相关性"
              key={PropsTab.CORRELATION}
              >
              <Toolbar>
                <ToolbarButton
                  text={formatMessage({ id: 'workspace.window.session.button.refresh' })}
                  icon={<SyncOutlined />}
                  onClick={
                    () =>{
                      console.log('刷新！');
                    }
                  }
                />
              </Toolbar>
              <EditableTable
                minHeight='200px'
                columns={tableColumns}
                rows={trigger.correlation || []}
                showCheckbox={false}
              />
              </TabPane>
              */}
              <TabPane tab={'DDL'} key={PropsTab.DDL}>
                <Toolbar>
                  <ToolbarButton
                    text={formatMessage({
                      id: 'workspace.window.session.button.edit',
                    })}
                    icon={<EditOutlined />}
                    onClick={this.editTrigger}
                  />

                  <ToolbarButton
                    text={
                      formatMessage({
                        id: 'odc.components.TriggerPage.Download',
                      }) //下载
                    }
                    icon={<CloudDownloadOutlined />}
                    onClick={() => {
                      downloadPLDDL(
                        trigger?.triggerName,
                        PLType.TRIGGER,
                        trigger?.ddl,
                        session?.odcDatabase?.name,
                      );
                    }}
                  />

                  <ToolbarButton
                    text={formatMessage({
                      id: 'workspace.window.sql.button.search',
                    })}
                    icon={<FileSearchOutlined />}
                    onClick={this.showSearchWidget}
                  />

                  <ToolbarButton
                    text={formatMessage({
                      id: 'workspace.window.session.button.refresh',
                    })}
                    icon={<SyncOutlined />}
                    onClick={this.reloadTrigger}
                  />

                  <ToolbarButton
                    text={
                      formated
                        ? formatMessage({
                            id: 'odc.components.TriggerPage.Unformat',
                          })
                        : // 取消格式化
                          formatMessage({
                            id: 'odc.components.TriggerPage.Formatting',
                          })
                      // 格式化
                    }
                    icon={<AlignLeftOutlined />}
                    onClick={this.handleFormat}
                    status={formated ? IConStatus.ACTIVE : IConStatus.INIT}
                  />
                </Toolbar>
                <ToolContentWrpper>
                  <SQLCodeEditorDDL
                    readOnly
                    defaultValue={(trigger && trigger.ddl) || ''}
                    language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
                    onEditorCreated={(editor: IEditor) => {
                      this.editor = editor;
                    }}
                  />
                </ToolContentWrpper>
              </TabPane>
            </ToolPageTabs>
          </Content>
        </>
      )
    );
  }
}

export default WrapSessionPage(
  function (props) {
    return (
      <SessionContext.Consumer>
        {({ session }) => {
          return <TriggerPage {...props} session={session} />;
        }}
      </SessionContext.Consumer>
    );
  },
  true,
  true,
);
