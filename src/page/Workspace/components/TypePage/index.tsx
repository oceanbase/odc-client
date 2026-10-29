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

import { getDataSourceModeConfig } from '@/common/datasource';
import { getType } from '@/common/network/type';
import { IEditor } from '@/component/MonacoEditor';
import { SQLCodePreviewer } from '@/component/SQLCodePreviewer';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { enableTypeEdit } from '@/constant';
import { PLType } from '@/constant/plType';
import type { IType } from '@/d.ts';
import { TypePropsTab } from '@/d.ts';
import { openTypeEditPageByName } from '@/store/helper/page';
import { TypePage as TypePageModel } from '@/store/helper/page/pages';
import type { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/database/sqlExport';
import { getLocalFormatDateTime } from '@/util/data/dateTime';
import {
  AlignLeftOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FileSearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Layout, message } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import ToolContentWrpper from '../ToolContentWrapper';
import ToolPageTabs from '../ToolPageTabs';
import ToolPageTextFromWrapper from '../ToolPageTextFormWrapper';
import styles from './index.less';

const { Content } = Layout;

const ToolbarButton = Toolbar.Button;

const TypeCodeMap = {
  OBJECT: formatMessage({ id: 'odc.components.TypePage.Object', defaultMessage: '对象' }), // 对象
  VARRAY: formatMessage({ id: 'odc.components.TypePage.Array', defaultMessage: '数组' }), // 数组
  TABLE: formatMessage({ id: 'odc.components.TypePage.Table', defaultMessage: '表' }), // 表
  COLLECTION: formatMessage({
    id: 'src.page.Workspace.components.TypePage.ACF1EB3E',
    defaultMessage: '集合',
  }), //'集合'
};
interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  params: TypePageModel['pageParams'];

  onUnsavedChange: (pageKey: string) => void;
}

@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
class TypePage extends Component<
  IProps & { session: SessionStore },
  {
    propsTab: TypePropsTab;
    type: Partial<IType>;
    formated: boolean;
  }
> {
  public editor: IEditor;
  public readonly state = {
    propsTab: this.props.params.propsTab || TypePropsTab.DDL,
    type: {
      typeName: '',
      type: null,
      owner: '',
      createTime: 0,
      lastDdlTime: 0,
      ddl: '',
    },

    formated: false,
  };

  public async componentDidMount() {
    await this.reloadType();
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

  private handleSwitchTab = (propsTab: TypePropsTab) => {
    const { pageStore, pageKey } = this.props;
    const { type } = this.state; // 更新 url

    pageStore.updatePage(
      pageKey,
      {},

      {
        typeName: type.typeName,
        propsTab,
      },
    );
  };
  private reloadType = async () => {
    const {
      session,
      params: { typeName },
    } = this.props;
    const type = await getType(typeName, false, session?.odcDatabase?.name, session?.sessionId);

    if (type) {
      this.setState({
        type,
      });
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.TypePage.FailedToLoadTheType',
          defaultMessage: '加载类型失败',
        }), // 加载类型失败
      );
    }
  };
  private handleEditType = () => {
    const {
      session,
      params: { typeName },
    } = this.props;
    openTypeEditPageByName(
      typeName,
      session?.sessionId,
      session?.odcDatabase?.id,
      session?.odcDatabase?.name,
    );
  };
  private showSearchWidget = () => {
    const codeEditor = this.editor;
    codeEditor.trigger('FIND_OR_REPLACE', 'actions.find', null);
  };

  private handleFormat = () => {
    const { formated, type } = this.state;
    if (!formated) {
      this.editor.doFormat();
    } else {
      this.editor.setValue(type?.ddl || '');
    }
    this.setState({
      formated: !formated,
    });
  };

  public render() {
    const { params, sessionManagerStore, session } = this.props;
    const { propsTab, type, formated } = this.state;
    const preTextForm = 'odc-toolPage-textFrom';
    return (
      type && (
        <>
          <Content className={styles.typePage}>
            <ToolPageTabs
              activeKey={propsTab}
              onChange={this.handleSwitchTab as any}
              items={[
                {
                  key: TypePropsTab.BASE_INFO,
                  label: formatMessage({
                    id: 'odc.components.TypePage.BasicInformation',
                    defaultMessage: '基本信息',
                  }),
                  children: (
                    <ToolContentWrpper>
                      <ToolPageTextFromWrapper>
                        <div className={`${preTextForm}-line`}>
                          <span className={`${preTextForm}-label`}>
                            {
                              formatMessage({
                                id: 'odc.components.TypePage.Name.1',
                                defaultMessage: '名称：',
                              })
                              /* 名称: */
                            }
                          </span>
                          <span className={`${preTextForm}-content`}>{type.typeName}</span>
                        </div>
                        <div className={`${preTextForm}-line`}>
                          <span className={`${preTextForm}-label`}>
                            {
                              formatMessage({
                                id: 'odc.components.TypePage.Owner.1',
                                defaultMessage: '所有者:',
                              })
                              /* 所有者: */
                            }
                          </span>
                          <span className={`${preTextForm}-content`}>{type.owner}</span>
                        </div>
                        <div className={`${preTextForm}-line`}>
                          <span className={`${preTextForm}-label`}>
                            {
                              formatMessage({
                                id: 'odc.components.TypePage.Type.1',
                                defaultMessage: '类型：',
                              })
                              /* 类型: */
                            }
                          </span>
                          <span className={`${preTextForm}-content`}>{TypeCodeMap[type.type]}</span>
                        </div>
                        <div className={`${preTextForm}-line`}>
                          <span className={`${preTextForm}-label`}>
                            {
                              formatMessage({
                                id: 'odc.components.TypePage.Created',
                                defaultMessage: '创建时间:',
                              })
                              /* 创建时间: */
                            }
                          </span>
                          <span className={`${preTextForm}-content`}>
                            {getLocalFormatDateTime(type.createTime)}
                          </span>
                        </div>
                        <div className={`${preTextForm}-line`}>
                          <span className={`${preTextForm}-label`}>
                            {
                              formatMessage({
                                id: 'odc.components.TypePage.ModificationTime',
                                defaultMessage: '修改时间:',
                              })

                              /* 修改时间: */
                            }
                          </span>
                          <span className={`${preTextForm}-content`}>
                            {getLocalFormatDateTime(type.lastDdlTime)}
                          </span>
                        </div>
                      </ToolPageTextFromWrapper>
                    </ToolContentWrpper>
                  ),
                },
                {
                  key: TypePropsTab.DDL,
                  label: 'DDL',
                  children: (
                    <>
                      <Toolbar>
                        {enableTypeEdit && (
                          <ToolbarButton
                            text={formatMessage({
                              id: 'workspace.window.session.button.edit',
                              defaultMessage: '编辑',
                            })}
                            icon={<EditOutlined />}
                            onClick={this.handleEditType}
                          />
                        )}

                        <ToolbarButton
                          text={
                            formatMessage({
                              id: 'odc.components.TypePage.Download',
                              defaultMessage: '下载',
                            }) //下载
                          }
                          icon={<CloudDownloadOutlined />}
                          onClick={() => {
                            downloadPLDDL(
                              type?.typeName,
                              PLType.TYPE,
                              type?.ddl,
                              session?.odcDatabase?.name,
                            );
                          }}
                        />

                        <ToolbarButton
                          text={formatMessage({
                            id: 'workspace.window.sql.button.search',
                            defaultMessage: '查找',
                          })}
                          icon={<FileSearchOutlined />}
                          onClick={this.showSearchWidget}
                        />

                        <ToolbarButton
                          text={formatMessage({
                            id: 'workspace.window.session.button.refresh',
                            defaultMessage: '刷新',
                          })}
                          icon={<SyncOutlined />}
                          onClick={this.reloadType}
                        />

                        <ToolbarButton
                          text={
                            formated
                              ? formatMessage({
                                  id: 'odc.components.TypePage.Unformat',
                                  defaultMessage: '取消格式化',
                                })
                              : // 取消格式化
                                formatMessage({
                                  id: 'odc.components.TypePage.Formatting',
                                  defaultMessage: '格式化',
                                })
                            // 格式化
                          }
                          icon={<AlignLeftOutlined />}
                          onClick={this.handleFormat}
                          status={formated ? IConStatus.ACTIVE : IConStatus.INIT}
                        />
                      </Toolbar>
                      <ToolContentWrpper>
                        <SQLCodePreviewer
                          readOnly
                          value={type?.ddl || ''}
                          language={
                            getDataSourceModeConfig(session?.connection?.type)?.sql?.language
                          }
                          onEditorCreated={(editor: IEditor) => {
                            this.editor = editor;
                          }}
                        />
                      </ToolContentWrpper>
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
  function (props: IProps) {
    return (
      <SessionContext.Consumer>
        {({ session }) => {
          return <TypePage {...props} session={session} />;
        }}
      </SessionContext.Consumer>
    );
  },
  true,
  false,
  true,
);
