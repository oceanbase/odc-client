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
