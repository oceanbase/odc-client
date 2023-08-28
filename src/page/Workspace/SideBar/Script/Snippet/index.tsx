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

import DragWrapper from '@/component/Dragable/component/DragWrapper';
import SnippetFormDrawer from '@/component/GrammerHelpSider/component/SnippetForm';
import { EnumSnippetAction, ISnippet, SnippetStore } from '@/store/snippet';
import Icon, { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Input, message, Modal, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import ListItem from '../../components/ListItem';
import styles from './index.less';

import CodeSvg from '@/svgr/Snippet.svg';
import { formatMessage } from '@/util/intl';
import { getWrapedSnippetBody } from '@/util/snippet';
import copyToCB from 'copy-to-clipboard';
import SnippetInfoToolTip from './Info';
import tracert from '@/util/tracert';

export default inject('snippetStore')(
  observer(
    forwardRef(function Snippet({ snippetStore }: { snippetStore?: SnippetStore }, ref) {
      const [snipptVisible, setSnipptVisible] = useState(false);
      const [snippet, setSnippet] = useState<ISnippet>(null);
      const [searchValue, setSearchValue] = useState('');
      const [isDraging, setIsDraging] = useState(false);
      useEffect(() => {
        snippetStore.resetSnippets();
        tracert.click('a3112.b41896.c330989.d367624');
      }, []);

      useImperativeHandle(
        ref,
        () => {
          return {
            newSnippet() {
              setSnipptVisible(true);
            },
            reload() {
              snippetStore.resetSnippets();
            },
          };
        },
        [],
      );

      const data = useMemo(() => {
        return snippetStore.snippets.filter((snippet: ISnippet) => {
          const isMatchkeyWord = !searchValue
            ? true
            : snippet.prefix.toUpperCase().indexOf(searchValue?.toUpperCase()) !== -1;
          return isMatchkeyWord;
        });
      }, [snippetStore?.snippets, searchValue]);

      return (
        <div className={styles.script}>
          <div className={styles.search}>
            <Input.Search
              onSearch={(v) => setSearchValue(v)}
              placeholder={formatMessage({
                id: 'odc.Script.Snippet.SearchForCodeSnippets',
              })} /*搜索代码片段*/
              size="small"
            />
          </div>
          <div className={styles.list}>
            <Spin spinning={snippetStore.loading}>
              {data?.map((snippet) => {
                return (
                  <SnippetInfoToolTip
                    hidden={isDraging || snipptVisible}
                    key={snippet.id}
                    snippet={snippet}
                  >
                    <DragWrapper
                      key={snippet.name}
                      useCustomerDragLayer={true}
                      onBegin={() => {
                        setIsDraging(true);
                        snippetStore.snippetDragging = {
                          ...snippet,
                          body: getWrapedSnippetBody(snippet.body),
                        };
                      }}
                      onEnd={() => {
                        setIsDraging(false);
                      }}
                    >
                      <ListItem
                        title={snippet.prefix}
                        desc={snippet.snippetType}
                        actions={[
                          {
                            icon: CopyOutlined,
                            title: formatMessage({ id: 'odc.Script.Snippet.Copy' }), //复制
                            onClick() {
                              copyToCB(
                                `<meta name='_!isODCSnippet_' content='yes' />${getWrapedSnippetBody(
                                  snippet.body,
                                )}`,
                                {
                                  format: 'text/html',
                                },
                              );
                              message.success(
                                formatMessage(
                                  {
                                    id:
                                      'odc.component.SnippetCard.SnippetprefixSyntaxHelpsCopySuccessfully',
                                  },
                                  { snippetPrefix: snippet.prefix },
                                ), //`${snippet.prefix} 代码片段复制成功！`
                              );
                            },
                          },
                          {
                            icon: EditOutlined,
                            title: formatMessage({ id: 'odc.Script.Snippet.Edit' }), //编辑
                            onClick() {
                              setSnipptVisible(true);
                              setSnippet(snippet);
                            },
                          },
                          {
                            icon: DeleteOutlined,
                            title: formatMessage({ id: 'odc.Script.Snippet.Delete' }), //删除
                            onClick() {
                              Modal.confirm({
                                title: formatMessage(
                                  {
                                    id: 'odc.component.GrammerHelpSider.AreYouSureYouWant',
                                  },
                                  { snippetPrefix: snippet.prefix },
                                ), //`确认删除代码片段：${snippet.prefix}?`
                                content: snippet.description,

                                async onOk() {
                                  const res = await snippetStore.deleteCustomerSnippet(snippet);

                                  if (res) {
                                    message.success(
                                      formatMessage(
                                        {
                                          id:
                                            'odc.component.GrammerHelpSider.TheSyntaxSnippetSnippetprefixHas',
                                        },
                                        { snippetPrefix: snippet.prefix },
                                      ), //`代码片段 ${snippet.prefix} 删除成功！`
                                    );
                                  }

                                  await snippetStore.resetSnippets();
                                },
                              });
                            },
                          },
                        ]}
                        icon={
                          <Icon component={CodeSvg} style={{ color: 'var(--brand-blue6-color)' }} />
                        }
                      />
                    </DragWrapper>
                  </SnippetInfoToolTip>
                );
              })}
            </Spin>
          </div>
          <SnippetFormDrawer
            visible={snipptVisible}
            action={snippet ? EnumSnippetAction.EDIT : EnumSnippetAction.CREATE}
            snippet={snippet}
            onClose={(reload) => {
              if (reload) {
                snippetStore.resetSnippets();
              }
              setSnipptVisible(false);
              setSnippet(null);
            }}
          />
        </div>
      );
    }),
  ),
);
