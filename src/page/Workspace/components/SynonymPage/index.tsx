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

import { getSynonym } from '@/common/network/synonym';
import { IEditor } from '@/component/MonacoEditor';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { PLType } from '@/constant/plType';
import type { ISynonym, SynonymType } from '@/d.ts';
import { ConnectionMode, SynonymPropsTab } from '@/d.ts';
import type { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { AlignLeftOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { Layout, message, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Component } from 'react';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import ToolPageTabs from '../ToolPageTabs';
import ToolPageTextFromWrapper from '../ToolPageTextFormWrapper';
import styles from './index.less';
import { getDataSourceModeConfig } from '@/common/datasource';

const { Content } = Layout;
const { TabPane } = Tabs;
const ToolbarButton = Toolbar.Button;
interface IProps {
  pageStore: PageStore;
  sessionManagerStore?: SessionManagerStore;
  pageKey: string;
  params: {
    synonymName: string;
    synonymType: SynonymType;
    propsTab: SynonymPropsTab;
    databaseId: number;
    dbName: string;
  };
}

@inject('pageStore', 'sessionManagerStore')
@observer
class SynonymPage extends Component<
  IProps & { session: SessionStore },
  {
    propsTab: SynonymPropsTab;
    synonym: Partial<ISynonym>;
    formated: boolean;
  }
> {
  public readonly state = {
    propsTab: this.props.params.propsTab || SynonymPropsTab.DDL,
    synonym: null,
    formated: false,
  };

  public editor: IEditor;

  public async componentDidMount() {
    const {
      params: { synonymName, synonymType },
    } = this.props;
    await this.reloadsynonym(synonymName, synonymType);
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

  private handleSwitchTab = (propsTab: SynonymPropsTab) => {
    const { pageStore, pageKey } = this.props;
    const { synonym } = this.state;
    this.setState({
      propsTab,
    });

    // 更新 url

    pageStore.updatePage(
      pageKey,
      {},

      {
        synonymName: synonym.synonymName,
        propsTab,
      },
    );
  };
  private reloadsynonym = async (synonymName: string, synonymType: SynonymType) => {
    const { session } = this.props;
    const synonym = await getSynonym(
      synonymName,
      synonymType,
      session?.sessionId,
      session?.odcDatabase?.name,
    );

    if (synonym) {
      this.setState({
        synonym,
      });
    } else {
      message.error(
        formatMessage({ id: 'odc.components.SynonymPage.FailedToLoadSynonyms' }), // 加载同义词失败
      );
    }
  };

  private handleFormat = () => {
    const { formated, synonym } = this.state;
    if (!formated) {
      this.editor.doFormat();
    } else {
      this.editor.setValue(synonym?.ddl || '');
    }
    this.setState({
      formated: !formated,
    });
  };

  public render() {
    const { sessionManagerStore, session } = this.props;
    const { propsTab, synonym, formated } = this.state;
    const preTextForm = 'odc-toolPage-textFrom';
    return (
      synonym && (
        <>
          <Content className={styles.synonymPage}>
            <ToolPageTabs activeKey={propsTab} onChange={this.handleSwitchTab as any}>
              <TabPane
                tab={formatMessage({
                  id: 'odc.components.SynonymPage.BasicInformation',
                })}
                /* 基本信息 */
                key={SynonymPropsTab.BASE_INFO}
              >
                <ToolPageTextFromWrapper>
                  <div className={`${preTextForm}-line`}>
                    <span className={`${preTextForm}-label`}>
                      {
                        formatMessage({
                          id: 'odc.components.SynonymPage.Name',
                        })

                        /* 名称: */
                      }
                    </span>
                    <span className={`${preTextForm}-content`}>{synonym.synonymName}</span>
                  </div>
                  <div className={`${preTextForm}-line`}>
                    <span className={`${preTextForm}-label`}>
                      {
                        formatMessage({
                          id: 'odc.components.SynonymPage.ObjectOwner',
                        })

                        /* 对象所有者: */
                      }
                    </span>
                    <span className={`${preTextForm}-content`}>{synonym.tableOwner}</span>
                  </div>
                  <div className={`${preTextForm}-line`}>
                    <span className={`${preTextForm}-label`}>
                      {
                        formatMessage({
                          id: 'odc.components.SynonymPage.ObjectName',
                        })

                        /* 对象名称: */
                      }
                    </span>
                    <span className={`${preTextForm}-content`}>{synonym.tableName}</span>
                  </div>
                  <div className={`${preTextForm}-line`}>
                    <span className={`${preTextForm}-label`}>
                      {
                        formatMessage({
                          id: 'odc.components.SynonymPage.Created',
                        })

                        /* 创建时间: */
                      }
                    </span>
                    <span className={`${preTextForm}-content`}>
                      {moment(synonym.created).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </div>
                  <div className={`${preTextForm}-line`}>
                    <span className={`${preTextForm}-label`}>
                      {
                        formatMessage({
                          id: 'odc.components.SynonymPage.ModificationTime',
                        })

                        /* 修改时间: */
                      }
                    </span>
                    <span className={`${preTextForm}-content`}>
                      {moment(synonym.lastDdlTime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </div>
                </ToolPageTextFromWrapper>
              </TabPane>
              <TabPane tab={'DDL'} key={SynonymPropsTab.DDL}>
                <Toolbar>
                  <ToolbarButton
                    text={
                      formatMessage({
                        id: 'odc.components.SynonymPage.Download',
                      }) //下载
                    }
                    icon={<CloudDownloadOutlined />}
                    onClick={() => {
                      downloadPLDDL(
                        synonym?.synonymName,
                        PLType.SYNONYM,
                        synonym?.ddl,
                        session?.odcDatabase?.name,
                      );
                    }}
                  />

                  <ToolbarButton
                    text={
                      formated
                        ? formatMessage({
                            id: 'odc.components.SynonymPage.Unformat',
                          })
                        : // 取消格式化
                          formatMessage({
                            id: 'odc.components.SynonymPage.Formatting',
                          })
                      // 格式化
                    }
                    icon={<AlignLeftOutlined />}
                    onClick={this.handleFormat}
                    status={formated ? IConStatus.ACTIVE : IConStatus.INIT}
                  />
                </Toolbar>
                <div style={{ height: `calc(100vh - ${40 + 28 + 39}px)`, position: 'relative' }}>
                  <SQLCodeEditorDDL
                    readOnly
                    defaultValue={(synonym && synonym.ddl) || ''}
                    language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
                    onEditorCreated={(editor: IEditor) => {
                      this.editor = editor;
                    }}
                  />
                </div>
              </TabPane>
            </ToolPageTabs>
          </Content>
        </>
      )
    );
  }
}
export default WrapSessionPage(function (props) {
  return (
    <SessionContext.Consumer>
      {({ session }) => {
        return <SynonymPage {...props} session={session} />;
      }}
    </SessionContext.Consumer>
  );
}, true);
