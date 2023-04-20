import { getTriggerByName } from '@/common/network/trigger';
import { actionTypes, WorkspaceAcess } from '@/component/Acess';
import { IEditor } from '@/component/MonacoEditor';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { PLType } from '@/constant/plType';
import type { ITrigger } from '@/d.ts';
import { ConnectionMode, TriggerState } from '@/d.ts';
import { openTriggerEditPageByName } from '@/store/helper/page';
import type { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
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
import ToolContentWrpper from '../ToolContentWrapper';
import ToolPageTabs from '../ToolPageTabs';
import ToolPageTextFromWrapper from '../ToolPageTextFormWrapper';
import styles from './index.less';

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

export enum PropsTab {
  BASE_INFO = 'INFO',
  BASE_OBJECT = 'BASE_OBJECT',
  CORRELATION = 'CORRELATION',
  DDL = 'DDL',
}

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  params: {
    sessionId: string;
    dbName: string;
    triggerName: string;
    propsTab: PropsTab;
    triggerData: ITrigger;
  };

  onUnsavedChange: (pageKey: string) => void;
}

@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
export default class TriggerPage extends Component<
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
      {
        updatePath: true,
      },

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
      params: { triggerName, sessionId, dbName },
    } = this.props;
    const trigger = await getTriggerByName(triggerName, sessionId, dbName);
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
      params: { triggerName, sessionId, dbName },
    } = this.props;
    openTriggerEditPageByName(triggerName, sessionId, dbName);
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
    const { sessionManagerStore, params } = this.props;
    const session = sessionManagerStore.sessionMap.get(params?.sessionId);
    session.database.getTriggerList();
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
    const {
      sessionManagerStore,
      params: { sessionId, dbName },
    } = this.props;
    const session = sessionManagerStore.sessionMap.get(sessionId);
    const { propsTab, trigger, isEditStatus, formated } = this.state;
    const isMySQL = session?.connection?.dialectType === ConnectionMode.OB_MYSQL;
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
                        <WorkspaceAcess action={actionTypes.update}>
                          <ToolbarButton
                            text={formatMessage({
                              id: 'workspace.window.session.button.edit',
                            })}
                            icon={<EditOutlined />}
                            onClick={this.handleEditBaseInfo}
                          />
                        </WorkspaceAcess>

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
                  <WorkspaceAcess action={actionTypes.update}>
                    <ToolbarButton
                      text={formatMessage({
                        id: 'workspace.window.session.button.edit',
                      })}
                      icon={<EditOutlined />}
                      onClick={this.editTrigger}
                    />
                  </WorkspaceAcess>

                  <ToolbarButton
                    text={
                      formatMessage({
                        id: 'odc.components.TriggerPage.Download',
                      }) //下载
                    }
                    icon={<CloudDownloadOutlined />}
                    onClick={() => {
                      downloadPLDDL(trigger?.triggerName, PLType.TRIGGER, trigger?.ddl, dbName);
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
                    language={isMySQL ? 'obmysql' : 'oboracle'}
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
