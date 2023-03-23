import { IEditor } from '@/component/MonacoEditor';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { enableTypeEdit } from '@/constant';
import { PLType } from '@/constant/plType';
import type { IType } from '@/d.ts';
import { ConnectionMode, TypePropsTab } from '@/d.ts';
import type { ConnectionStore } from '@/store/connection';
import { openTypeEditPageByName } from '@/store/helper/page';
import type { PageStore } from '@/store/page';
import type { SchemaStore } from '@/store/schema';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { getLocalFormatDateTime } from '@/util/utils';
import {
  AlignLeftOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FileSearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Layout, message, Tabs } from 'antd';
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
    name: formatMessage({ id: 'odc.components.TypePage.Name' }), // 名称
    resizable: true,
    sortable: false,
  },

  {
    key: 'owner',
    name: formatMessage({ id: 'odc.components.TypePage.Owner' }), // 所有者
    resizable: true,
    sortable: false,
  },

  {
    key: 'type',
    name: formatMessage({ id: 'odc.components.TypePage.Type' }), // 类型
    resizable: true,
    sortable: false,
  },

  {
    key: 'status',
    name: formatMessage({ id: 'odc.components.TypePage.State' }), // 状态
    resizable: true,
    sortable: false,
  },
];

const TypeCodeMap = {
  OBJECT: formatMessage({ id: 'odc.components.TypePage.Object' }), // 对象
  VARRAY: formatMessage({ id: 'odc.components.TypePage.Array' }), // 数组
  TABLE: formatMessage({ id: 'odc.components.TypePage.Table' }), // 表
};
interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  schemaStore: SchemaStore;
  connectionStore: ConnectionStore;
  pageKey: string;
  params: {
    typeName: string;
    propsTab: TypePropsTab;
  };

  onUnsavedChange: (pageKey: string) => void;
}

@inject('sqlStore', 'schemaStore', 'pageStore', 'connectionStore')
@observer
export default class TypePage extends Component<
  IProps,
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
      {
        updatePath: true,
      },

      {
        typeName: type.typeName,
        propsTab,
      },
    );
  };
  private reloadType = async () => {
    const {
      schemaStore,
      params: { typeName },
    } = this.props;
    const type = await schemaStore.loadType(typeName);

    if (type) {
      this.setState({
        type,
      });
    } else {
      message.error(
        formatMessage({ id: 'odc.components.TypePage.FailedToLoadTheType' }), // 加载类型失败
      );
    }
  };
  private handleEditType = () => {
    const {
      params: { typeName },
    } = this.props;
    openTypeEditPageByName(typeName);
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
    const {
      connectionStore: { connection },
    } = this.props;
    const { propsTab, type, formated } = this.state;
    const isMySQL = connection.dbMode === ConnectionMode.OB_MYSQL;
    const preTextForm = 'odc-toolPage-textFrom';
    return (
      type && (
        <>
          <Content className={styles.typePage}>
            <ToolPageTabs activeKey={propsTab} onChange={this.handleSwitchTab as any}>
              <TabPane
                tab={formatMessage({
                  id: 'odc.components.TypePage.BasicInformation',
                })}
                /* 基本信息 */
                key={TypePropsTab.BASE_INFO}
              >
                <ToolContentWrpper>
                  <ToolPageTextFromWrapper>
                    <div className={`${preTextForm}-line`}>
                      <span className={`${preTextForm}-label`}>
                        {
                          formatMessage({
                            id: 'odc.components.TypePage.Name.1',
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
              </TabPane>
              {/**
               * 本期（2.4.0）不支持该功能 <TabPane tab="相关性" key={TypePropsTab.CORRELATION} > <Toolbar>
               * <ToolbarButton text={formatMessage({ id:
               * 'workspace.window.session.button.refresh' })} icon={<SyncOutlined />} onClick={
               * () =>{ console.log('刷新！'); } } /> </Toolbar> <EditableTable minHeight='200px'
               * columns={tableColumns} rows={trigger.correlation || []} showCheckbox={false} /> </TabPane>
               */}
              <TabPane tab={'DDL'} key={TypePropsTab.DDL}>
                <Toolbar>
                  {enableTypeEdit && (
                    <ToolbarButton
                      text={formatMessage({
                        id: 'workspace.window.session.button.edit',
                      })}
                      icon={<EditOutlined />}
                      onClick={this.handleEditType}
                    />
                  )}

                  <ToolbarButton
                    text={
                      formatMessage({ id: 'odc.components.TypePage.Download' }) //下载
                    }
                    icon={<CloudDownloadOutlined />}
                    onClick={() => {
                      downloadPLDDL(type?.typeName, PLType.TYPE, type?.ddl);
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
                    onClick={this.reloadType}
                  />

                  <ToolbarButton
                    text={
                      formated
                        ? formatMessage({
                            id: 'odc.components.TypePage.Unformat',
                          })
                        : // 取消格式化
                          formatMessage({
                            id: 'odc.components.TypePage.Formatting',
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
                    defaultValue={(type && type.ddl) || ''}
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
