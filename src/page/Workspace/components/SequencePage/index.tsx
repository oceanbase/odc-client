import { getSequence } from '@/common/network/sequence';
import { actionTypes, WorkspaceAcess } from '@/component/Acess';
import { IEditor } from '@/component/MonacoEditor';
import ObjectInfoView from '@/component/ObjectInfoView';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { ConnectionMode, ISequence } from '@/d.ts';
import type { ModalStore } from '@/store/modal';
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
  SyncOutlined,
} from '@ant-design/icons';
import { Layout, Spin, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { FormattedMessage } from 'umi';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import styles from './index.less';

const { Content } = Layout;
const { TabPane } = Tabs;
const ToolbarButton = Toolbar.Button;

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
  modalStore?: ModalStore;
  pageKey: string;
  params: {
    sequenceName: string;
    propsTab: PropsTab;
    databaseId: number;
    dbName: string;
  };

  onUnsavedChange: (pageKey: string) => void;
}

interface IState {
  propsTab: PropsTab;
  formated: boolean;
  sequence: ISequence;
}

@inject('sqlStore', 'pageStore', 'sessionManagerStore', 'modalStore')
@observer
class SequencePage extends Component<IProps & { session: SessionStore }, IState> {
  public editor: IEditor;

  public readonly state: IState = {
    propsTab: this.props.params.propsTab || PropsTab.INFO,
    formated: false,
    sequence: null,
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
  private getSequence = () => {
    return this.state.sequence;
  };
  public handlePropsTabChanged = (propsTab: PropsTab) => {
    const { pageStore, pageKey } = this.props;
    const sequence = this.getSequence();
    this.setState({ propsTab });
    // 更新 url
    pageStore.updatePage(
      pageKey,
      {},
      {
        sequenceName: sequence.name,
        propsTab,
      },
    );
  };

  public reloadSequence = async (sequenceName: string) => {
    const { session } = this.props;
    const sequence = await getSequence(sequenceName, session?.sessionId, session?.database?.dbName);
    sequence &&
      this.setState({
        sequence,
      });
  };

  public async componentDidMount() {
    const {
      params: { sequenceName },
    } = this.props;

    await this.reloadSequence(sequenceName);
  }

  private handleFormat = () => {
    const { formated } = this.state;
    const sequence = this.getSequence();
    if (!formated) {
      this.editor.doFormat();
    } else {
      this.editor.setValue(sequence?.ddl || '');
    }
    this.setState({
      formated: !formated,
    });
  };

  private showSequenceEditModal = () => {
    const sequence = this.getSequence();
    this.props.modalStore.changeCreateSequenceModalVisible(true, {
      isEdit: true,
      data: sequence,
      databaseId: this.props.params.databaseId,
      dbName: this.props.params.dbName,
    });
  };

  public render() {
    const { params, session } = this.props;
    const { propsTab, formated } = this.state;
    const sequence = this.getSequence();
    const isMySQL = session?.connection.dialectType === ConnectionMode.OB_MYSQL;

    return sequence ? (
      <>
        <Content>
          <Tabs
            activeKey={propsTab}
            tabPosition="left"
            className={styles.propsTab}
            onChange={this.handlePropsTabChanged as any}
          >
            <TabPane
              tab={formatMessage({
                id: 'workspace.window.sequence.propstab.info',
              })}
              key={PropsTab.INFO}
            >
              <WorkspaceAcess action={actionTypes.update}>
                <Toolbar>
                  <Toolbar.Button
                    text={<FormattedMessage id="workspace.window.session.button.edit" />}
                    icon={<EditOutlined />}
                    onClick={this.showSequenceEditModal}
                  />

                  <ToolbarButton
                    text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                    icon={<SyncOutlined />}
                    onClick={this.reloadSequence.bind(this, params.sequenceName)}
                  />
                </Toolbar>
              </WorkspaceAcess>
              <ObjectInfoView
                data={[
                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.SequenceName',
                    }),
                    // 序列名称
                    content: sequence.name,
                  },

                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.NextBufferValue',
                    }),
                    // 下一个缓冲值
                    content: sequence.nextCacheValue,
                  },

                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.Incremental',
                    }),
                    // 增量
                    content: sequence.increament,
                  },

                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.ValidValues',
                    }),
                    // 取值范围
                    content: `${sequence.minValue} ~ ${sequence.maxValue}`,
                  },

                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.CacheSettings',
                    }),
                    // 缓存设置
                    content: sequence.cached
                      ? formatMessage({
                          id: 'odc.components.SequencePage.Cache',
                        }) +
                        // `缓存 `
                        sequence.cacheSize
                      : formatMessage({
                          id: 'odc.components.SequencePage.NoCache',
                        }),
                    // 不缓存
                  },
                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.Sort',
                    }),
                    // 是否排序
                    content: sequence.orderd
                      ? formatMessage({ id: 'odc.components.SequencePage.Is' }) // 是
                      : formatMessage({ id: 'odc.components.SequencePage.No' }), // 否
                  },
                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.LoopOrNot',
                    }),
                    // 是否循环
                    content: sequence.cycled
                      ? formatMessage({ id: 'odc.components.SequencePage.Is' }) // 是
                      : formatMessage({ id: 'odc.components.SequencePage.No' }), // 否
                  },
                  {
                    label: formatMessage({
                      id: 'odc.components.SequencePage.Owner',
                    }),
                    // 所有者
                    content: sequence.user,
                  },
                ]}
              />
            </TabPane>
            <TabPane tab={'DDL'} key={PropsTab.DDL}>
              <Toolbar>
                <ToolbarButton
                  text={
                    formatMessage({
                      id: 'odc.components.SequencePage.Download',
                    }) //下载
                  }
                  icon={<CloudDownloadOutlined />}
                  onClick={() => {
                    downloadPLDDL(sequence?.name, 'SEQUENCE', sequence?.ddl, params.dbName);
                  }}
                />

                <ToolbarButton
                  text={
                    formated
                      ? formatMessage({
                          id: 'odc.components.SequencePage.Unformat',
                        })
                      : // 取消格式化
                        formatMessage({
                          id: 'odc.components.SequencePage.Formatting',
                        })

                    // 格式化
                  }
                  icon={<AlignLeftOutlined />}
                  onClick={this.handleFormat}
                  status={formated ? IConStatus.ACTIVE : IConStatus.INIT}
                />

                <ToolbarButton
                  text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                  icon={<SyncOutlined />}
                  onClick={this.reloadSequence.bind(this, params.sequenceName)}
                />
              </Toolbar>
              <div style={{ height: `calc(100vh - ${40 + 28 + 38}px)`, position: 'relative' }}>
                <SQLCodeEditorDDL
                  readOnly
                  defaultValue={(sequence && sequence.ddl) || ''}
                  language={isMySQL ? 'obmysql' : 'oboracle'}
                  onEditorCreated={(editor: IEditor) => {
                    this.editor = editor;
                  }}
                />
              </div>
            </TabPane>
          </Tabs>
        </Content>
      </>
    ) : (
      <Spin />
    );
  }
}

export default WrapSessionPage(function (props: IProps) {
  return (
    <SessionContext.Consumer>
      {({ session }) => {
        return <SequencePage {...props} session={session} />;
      }}
    </SessionContext.Consumer>
  );
}, true);
