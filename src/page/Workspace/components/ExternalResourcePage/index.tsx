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

import MonacoEditor from '@/component/MonacoEditor';
import ObjectInfoView from '@/component/ObjectInfoView';
import Toolbar from '@/component/Toolbar';
import type { PageStore } from '@/store/page';
import type { SQLStore } from '@/store/sql';
import { CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { Descriptions, Layout, message, Tabs, Typography, Card, Empty } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

import { ExternalResourcePage as ExternalResourcePageModel } from '@/store/helper/page/pages';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import styles from './index.less';
import { isContentSizeWithinLimit } from '@/util/data/byte';
import { getLanguageFromResourceType } from '@/util/data/string';

const ToolbarButton = Toolbar.Button;
const { Content } = Layout;
const { Text } = Typography;

// 属性 Tab key 枚举
export enum PropsTab {
  INFO = 'INFO',
  CONTENT = 'CONTENT',
}

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  params: ExternalResourcePageModel['pageParams'];

  onUnsavedChange: (pageKey: string) => void;
}

interface IExternalResourceInfo {
  name: string;
  type?: string;
  size?: number;
  description?: string;
  createTime?: string;
  updateTime?: string;
  owner?: string;
  status?: string;
  content?: string;
  // externalResourceProperties 相关属性
  url?: string;
  schemaName?: string;
}
@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
class ExternalResourcePage extends Component<
  IProps & { session: SessionStore },
  {
    propsTab: PropsTab;
    resourceInfo: IExternalResourceInfo | null;
    loading: boolean;
  }
> {
  public readonly state = {
    propsTab: (this.props.params.propsTab as PropsTab) || PropsTab.INFO,
    resourceInfo: null,
    loading: false,
  };

  public UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    if (
      nextProps.params &&
      this.props.params &&
      this.props.params.propsTab &&
      nextProps.params.propsTab !== this.state.propsTab
    ) {
      this.setState({
        propsTab: nextProps.params.propsTab as PropsTab,
      });
    }
  }

  public handlePropsTabChanged = (propsTab: PropsTab) => {
    const { pageStore, pageKey } = this.props;
    const { resourceInfo } = this.state;
    this.setState({ propsTab });

    // 更新 url
    pageStore.updatePage(pageKey, undefined, {
      path: true,
      resourceName: resourceInfo?.name,
      propsTab,
    });
  };

  public reloadExternalResource = async (resourceName: string) => {
    const { session } = this.props;

    if (!session?.database?.loadExternalResource) {
      message.error(
        formatMessage({
          id: 'src.page.Workspace.components.ExternalResourcePage.F0DDFCD6',
          defaultMessage: '无法加载外部资源',
        }),
      );
      return;
    }

    this.setState({ loading: true });

    try {
      // 先从现有列表中找到基本信息
      const existingResource = session.database.externalResources?.find(
        (r) => r.name === resourceName,
      );

      // 加载详细信息
      const resourceData = await session.database.loadExternalResource(
        existingResource || { name: resourceName },
      );
      if (resourceData) {
        this.setState({
          resourceInfo: {
            name: resourceData.name || resourceName,
            type: resourceData.type || existingResource?.type,
            size: resourceData.size,
            description: resourceData.description,
            createTime: resourceData.createTime,
            updateTime: resourceData.updateTime,
            owner: resourceData.owner,
            status: resourceData.status,
            content: resourceData.content,
            url: resourceData.externalResourceProperties?.url,
            schemaName: resourceData.schemaName || existingResource?.schemaName,
          },
        });
      } else {
        message.error(
          formatMessage({
            id: 'src.page.Workspace.components.ExternalResourcePage.3A76AB8C',
            defaultMessage: '无法获取外部资源详情',
          }),
        );
      }
    } catch (error) {
      console.error('加载外部资源详情失败:', error);
      message.error(
        formatMessage({
          id: 'src.page.Workspace.components.ExternalResourcePage.87C47935',
          defaultMessage: '加载外部资源详情失败',
        }),
      );
    } finally {
      this.setState({ loading: false });
    }
  };

  public async componentDidMount() {
    const {
      params: { resourceName },
    } = this.props;

    await this.reloadExternalResource(resourceName);
  }

  private handleDownload = async () => {
    const { resourceInfo } = this.state;
    const { session } = this.props;

    if (!resourceInfo || !session?.database?.downloadExternalResource) {
      message.error(
        formatMessage({
          id: 'src.page.Workspace.components.ExternalResourcePage.7BC2AD8B',
          defaultMessage: '无法下载外部资源',
        }),
      );
      return;
    }

    try {
      const success = await session.database.downloadExternalResource(resourceInfo);
      if (success) {
        message.success(
          formatMessage({
            id: 'src.page.Workspace.components.ExternalResourcePage.9B750DF0',
            defaultMessage: '外部资源下载成功',
          }),
        );
      } else {
        message.error(
          formatMessage({
            id: 'src.page.Workspace.components.ExternalResourcePage.B940DDF5',
            defaultMessage: '外部资源下载失败',
          }),
        );
      }
    } catch (error) {
      console.error('下载外部资源失败:', error);
      message.error(
        formatMessage({
          id: 'src.page.Workspace.components.ExternalResourcePage.52A2768D',
          defaultMessage: '下载外部资源失败',
        }),
      );
    }
  };

  public render() {
    const {
      params: { resourceName },
    } = this.props;
    const { propsTab, resourceInfo, loading } = this.state;

    return (
      <Content style={{ height: '100%' }}>
        <Tabs
          activeKey={propsTab}
          tabPosition="left"
          size="small"
          className={styles.propsTab}
          onChange={this.handlePropsTabChanged as any}
          items={[
            {
              key: PropsTab.INFO,
              label: formatMessage({
                id: 'workspace.window.table.propstab.info',
                defaultMessage: '基本信息',
              }),
              children: (
                <div className={styles.content}>
                  {loading ? (
                    <Card loading />
                  ) : resourceInfo ? (
                    <ObjectInfoView
                      data={[
                        {
                          label: formatMessage({
                            id: 'src.page.Workspace.components.ExternalResourcePage.1B4BAD5A',
                            defaultMessage: '资源名称',
                          }),
                          content: resourceInfo.name,
                        },
                        {
                          label: formatMessage({
                            id: 'src.page.Workspace.components.ExternalResourcePage.25701460',
                            defaultMessage: '资源类型',
                          }),
                          content: resourceInfo.type || 'PYTHON_PY',
                        },
                        {
                          label: formatMessage({
                            id: 'src.page.Workspace.components.ExternalResourcePage.FAE52548',
                            defaultMessage: '描述',
                          }),
                          content: resourceInfo.description || '-',
                        },
                      ]}
                    />
                  ) : (
                    <Empty
                      description={formatMessage({
                        id: 'src.page.Workspace.components.ExternalResourcePage.853BE24C',
                        defaultMessage: '无法加载外部资源信息',
                      })}
                    />
                  )}
                </div>
              ),
            },
            {
              key: PropsTab.CONTENT,
              label: formatMessage({
                id: 'src.page.Workspace.components.ExternalResourcePage.2C5B1790',
                defaultMessage: '内容',
              }),
              children: (
                <div className={styles.content}>
                  <Toolbar>
                    <ToolbarButton
                      text={formatMessage({
                        id: 'src.page.Workspace.components.ExternalResourcePage.3C3245EA',
                        defaultMessage: '下载',
                      })}
                      icon={<CloudDownloadOutlined style={{ fontSize: 13 }} />}
                      onClick={this.handleDownload}
                      disabled={!resourceInfo}
                    />

                    <ToolbarButton
                      text={formatMessage({
                        id: 'workspace.window.session.button.refresh',
                        defaultMessage: '刷新',
                      })}
                      icon={<SyncOutlined style={{ fontSize: 13 }} />}
                      loading={loading}
                      onClick={() => this.reloadExternalResource(resourceName)}
                    />
                  </Toolbar>
                  {loading ? (
                    <Card loading />
                  ) : resourceInfo?.content && isContentSizeWithinLimit(resourceInfo.content) ? (
                    <div className={styles.editorContainer}>
                      <MonacoEditor
                        defaultValue={resourceInfo.content}
                        language={getLanguageFromResourceType(resourceInfo.type)}
                        readOnly={true}
                        showLineNumbers={true}
                      />
                    </div>
                  ) : (
                    <Empty
                      className={styles.empty}
                      description={formatMessage({
                        id: 'src.page.Workspace.components.ExternalResourcePage.AA3CFE7D',
                        defaultMessage: '当前内容暂不支持在线查看内容，请选择下载文件',
                      })}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                  {resourceInfo?.content && isContentSizeWithinLimit(resourceInfo.content) ? (
                    <div className={styles.tips}>
                      {formatMessage({
                        id: 'src.page.Workspace.components.ExternalResourcePage.78356D88',
                        defaultMessage: '仅支持在线查看 1MB 数据，如需查看全部请下载文件',
                      })}
                    </div>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </Content>
    );
  }
}

export default WrapSessionPage(
  function (props: IProps) {
    return (
      <SessionContext.Consumer>
        {({ session }) => <ExternalResourcePage {...props} session={session} />}
      </SessionContext.Consumer>
    );
  },
  true,
  true,
);
