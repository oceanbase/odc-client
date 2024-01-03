/*
 * Copyright 2024 OceanBase
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

import {
  EnumSnippetAction,
  EnumSnippetType,
  ISnippet,
  SnippetStore,
  SNIPPET_TYPES,
} from '@/store/snippet';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Dropdown, Empty, Input, Layout, Menu, message, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import SnippetCard from './component/SnippetCard';
import SnippetForm from './component/SnippetForm';
import styles from './index.less';
const { Sider } = Layout;
const { Search } = Input;
const { confirm } = Modal;

@inject('snippetStore')
@observer
class GrammerHelpSider extends Component<
  {
    collapsed: boolean;
    snippetStore?: SnippetStore;
    onCollapse: () => void;
  },
  {
    showSnippetForm: boolean;
    currectType: string;
    keyword: string;
    action: EnumSnippetAction;
    snippet: ISnippet;
  }
> {
  readonly state = {
    showSnippetForm: false,
    currectType: EnumSnippetType.ALL,
    action: null,
    snippet: null,
    keyword: '',
  };

  public render() {
    const { currectType } = this.state;
    const snippets = this.getFilterSnippets();
    const targetSnippetType = SNIPPET_TYPES.find((snippet) => snippet.key === currectType);
    return (
      <Sider
        className={styles['snippet-sider']}
        width={240}
        collapsible={true}
        collapsed={this.props.collapsed}
        collapsedWidth={0}
        trigger={null}
      >
        <div className={styles['snippet-sider-header']}>
          <span>
            {
              formatMessage({
                id: 'odc.component.GrammerHelpSider.YouCanDragCodeSnippets',
              }) /*可将代码片段拖入编辑器使用*/
            }
          </span>
          <CloseOutlined onClick={this.props.onCollapse} />
        </div>
        <div className={styles['snippet-sider-body']}>
          <div className={styles['snippet-sider-searchbar']}>
            <Search
              placeholder={formatMessage({
                id: 'odc.component.GrammerHelpSider.SearchSyntaxHelp',
              })}
              /*搜索代码片段*/
              onChange={this.handleSearchChange}
              onSearch={this.handleSearch}
            />
            <a style={{ whiteSpace: 'nowrap' }} onClick={this.handleCreateSnippet}>
              <PlusOutlined />
              {
                formatMessage({
                  id: 'odc.component.GrammerHelpSider.New',
                }) /*新建*/
              }
            </a>
          </div>
          <div className={styles['snippet-sider-filter']}>
            <Dropdown
              overlay={
                <Menu onClick={this.handleTypeChange}>
                  {SNIPPET_TYPES.map((snippetType) => (
                    <Menu.Item key={snippetType.key}>{snippetType.name}</Menu.Item>
                  ))}
                </Menu>
              }
            >
              <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                {targetSnippetType.name} <DownOutlined />
              </a>
            </Dropdown>
            <span>
              {
                formatMessage(
                  {
                    id: 'odc.component.GrammerHelpSider.SnippetslacksInTotal',
                  },
                  { snippetsLength: snippets.length },
                ) /*共 {snippetsLength} 条*/
              }
            </span>
          </div>
          <div className={styles['snippet-sider-card-list']}>
            {!snippets.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
            {snippets.length
              ? snippets.map((snippet) => (
                  <SnippetCard
                    key={snippet.prefix}
                    handleSnippetMenuClick={(action) => {
                      this.handleSnippetMenuClick(action, snippet);
                    }}
                    snippet={snippet}
                  />
                ))
              : null}
          </div>
        </div>
        <SnippetForm
          visible={this.state.showSnippetForm}
          action={this.state.action}
          snippet={this.state.snippet}
          onClose={this.onCloseSnippetForm}
        />
      </Sider>
    );
  }

  public handleCreateSnippet = () => {
    this.setState({
      showSnippetForm: true,
      action: EnumSnippetAction.CREATE,
      snippet: null,
    });
  };
  public onCloseSnippetForm = (isNeedReload?: boolean) => {
    const { snippetStore } = this.props;
    const { currectType } = this.state;
    this.setState(
      {
        showSnippetForm: false,
        currectType: isNeedReload ? EnumSnippetType.ALL : currectType,
      },
      async () => {
        if (isNeedReload) {
          await snippetStore.resetSnippets();
        }
      },
    );
  };
  public handleSearch = async (keyword: string) => {
    this.setState({
      keyword,
    });
  };
  public handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await this.handleSearch(e.target.value);
  };
  public handleTypeChange = (item) => {
    this.setState({
      currectType: item.key,
    });
  };
  public handleSnippetMenuClick = (actionKey, snippet) => {
    const { snippetStore } = this.props;

    switch (actionKey) {
      case EnumSnippetAction.EDIT:
        this.setState({
          showSnippetForm: true,
          action: EnumSnippetAction.EDIT,
          snippet,
        });
        break;

      case EnumSnippetAction.DELETE:
        confirm({
          title: formatMessage(
            {
              id: 'odc.component.GrammerHelpSider.AreYouSureYouWant',
            },
            { snippetPrefix: snippet.prefix },
          ), //`确认删除代码片段：${snippet.prefix}?`
          content: snippet.desc,

          async onOk() {
            const res = await snippetStore.deleteCustomerSnippet(snippet);

            if (res) {
              message.success(
                formatMessage(
                  {
                    id: 'odc.component.GrammerHelpSider.TheSyntaxSnippetSnippetprefixHas',
                  },
                  { snippetPrefix: snippet.prefix },
                ), //`代码片段 ${snippet.prefix} 删除成功！`
              );
            }

            await snippetStore.resetSnippets();
          },
        });
        break;

      default:
        break;
    }
  };

  public getFilterSnippets() {
    const { snippetStore } = this.props;
    const { keyword, currectType } = this.state;
    return snippetStore.snippets.filter((snippet: ISnippet) => {
      const isMatchType =
        currectType === EnumSnippetType.ALL ? true : snippet.snippetType === currectType;
      const isMatchkeyWord = !keyword
        ? true
        : snippet.prefix.toUpperCase().indexOf(keyword.toUpperCase()) !== -1;
      return isMatchType && isMatchkeyWord;
    });
  }
}

export default GrammerHelpSider;
