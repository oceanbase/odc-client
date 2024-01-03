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

import DragWrapper from '@/component/Dragable/component/DragWrapper';
import snippetStore, {
  EnumSnippetAction,
  ISnippet,
  SNIPPET_ACTIONS,
  SNIPPET_TYPES,
} from '@/store/snippet';
import { formatMessage } from '@/util/intl';
import { getSnippetText, getWrapedSnippetBody } from '@/util/snippet';
import { CopyOutlined, EllipsisOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Dropdown, Menu, message, Popover, Typography } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styles from './index.less';

export default ({ snippet, handleSnippetMenuClick }, {}) => {
  if (!snippet) {
    return null;
  }

  function renderSnippetInfoIcon(snippet: ISnippet) {
    return (
      <Popover
        placement="bottomRight"
        arrowPointAtCenter={true}
        overlayClassName={styles['snippet-popover']}
        title={<>{snippet.prefix}:</>}
        content={
          <div>
            <dl>
              <dt>
                {
                  formatMessage({
                    id: 'odc.component.SnippetCard.Syntax',
                  }) /*代码片段*/
                }
              </dt>
              <dd>
                <pre style={{ maxHeight: 300 }}>{getSnippetText(snippet.body)}</pre>
              </dd>
              <dt>
                {
                  formatMessage({
                    id: 'odc.component.SnippetCard.Description',
                  }) /*描述*/
                }
              </dt>
              <dd style={{ wordBreak: 'break-all' }}>{snippet.description || 'no descrption'}</dd>
            </dl>
            <footer>{snippet.snippetType}</footer>
          </div>
        }
      >
        <QuestionCircleOutlined />
      </Popover>
    );
  }

  function renderSnippetIconAction(snippet: ISnippet) {
    if (snippet.buildIn) {
      return null;
    }

    return (
      <Dropdown
        overlay={
          <Menu
            style={{
              width: '100px',
            }}
            onClick={(item) => {
              handleSnippetMenuClick(item.key, snippet);
            }}
          >
            {SNIPPET_ACTIONS.filter((action) => action.key !== EnumSnippetAction.CREATE).map(
              (action) => {
                return <Menu.Item key={action.key}>{action.name}</Menu.Item>;
              },
            )}
          </Menu>
        }
        placement="bottomRight"
      >
        <EllipsisOutlined />
      </Dropdown>
    );
  }

  function renderSnippetTypeName(snippet: ISnippet) {
    const snippetTypeItem = SNIPPET_TYPES.find((item) => item.key === snippet.snippetType);
    return snippetTypeItem.name;
  }

  return (
    <DragWrapper
      key={snippet.name}
      useCustomerDragLayer={true}
      onBegin={() => {
        snippetStore.snippetDragging = {
          ...snippet,
          body: getWrapedSnippetBody(snippet.body),
        };
      }}
    >
      <Card
        className={styles['snippet-sider-card']}
        size="small"
        title={
          <div>
            <span className={styles['snippet-keyword']}>{snippet.prefix}</span>
            &nbsp;
            {renderSnippetInfoIcon(snippet)}
          </div>
        }
        extra={renderSnippetIconAction(snippet)}
      >
        <div className={styles['snippet-card-desc']}>
          {snippet.description || (
            <Typography.Paragraph ellipsis={{ rows: 2 }}>{snippet.body}</Typography.Paragraph>
          )}
        </div>
        <div className={styles['snippet-card-footer']}>
          <span>{renderSnippetTypeName(snippet)}</span>
          <CopyToClipboard
            key="copy"
            options={{
              format: 'text/html',
            }}
            text={`<meta name='_!isODCSnippet_' content='yes' />${getWrapedSnippetBody(
              snippet.body,
            )}`}
            onCopy={() => {
              message.success(
                formatMessage(
                  {
                    id: 'odc.component.SnippetCard.SnippetprefixSyntaxHelpsCopySuccessfully',
                  },
                  { snippetPrefix: snippet.prefix },
                ), //`${snippet.prefix} 代码片段复制成功！`
              );
            }}
          >
            <CopyOutlined />
          </CopyToClipboard>
        </div>
      </Card>
    </DragWrapper>
  );
};
