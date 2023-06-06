import SnippetFormDrawer from '@/component/GrammerHelpSider/component/SnippetForm';
import { EnumSnippetAction, ISnippet, SnippetStore } from '@/store/snippet';
import Icon from '@ant-design/icons';
import { Input, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import ListItem from '../../components/ListItem';
import styles from './index.less';

import CodeSvg from '@/svgr/Snippet.svg';
import SnippetInfoToolTip from './Info';

export default inject('snippetStore')(
  observer(
    forwardRef(function Snippet({ snippetStore }: { snippetStore?: SnippetStore }, ref) {
      const [snipptVisible, setSnipptVisible] = useState(false);
      const [searchValue, setSearchValue] = useState('');
      useEffect(() => {
        snippetStore.resetSnippets();
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
              placeholder="搜索代码片段"
              size="small"
            />
          </div>
          <div className={styles.list}>
            <Spin spinning={snippetStore.loading}>
              {data?.map((snippet) => {
                return (
                  <SnippetInfoToolTip key={snippet.id} snippet={snippet}>
                    <ListItem
                      title={snippet.prefix}
                      desc={snippet.snippetType}
                      actions={[]}
                      icon={
                        <Icon component={CodeSvg} style={{ color: 'var(--brand-blue6-color)' }} />
                      }
                    />
                  </SnippetInfoToolTip>
                );
              })}
            </Spin>
          </div>
          <SnippetFormDrawer
            visible={snipptVisible}
            action={EnumSnippetAction.CREATE}
            snippet={null}
            onClose={(reload) => {
              if (reload) {
                snippetStore.resetSnippets();
              }
              setSnipptVisible(false);
            }}
          />
        </div>
      );
    }),
  ),
);
