import { ISnippet } from '@/store/snippet';
import { Popover } from 'antd';

import { formatMessage } from '@/util/intl';
import { getSnippetText } from '@/util/snippet';
import styles from './info.less';

const SnippetInfoToolTip: React.FC<{
  snippet: ISnippet;
  hidden?: boolean;
}> = function ({ snippet, hidden, children }) {
  return (
    <Popover
      placement="right"
      arrowPointAtCenter={true}
      overlayClassName={styles['snippet-popover']}
      title={<>{snippet.prefix}:</>}
      showArrow={false}
      open={hidden ? false : undefined}
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
      <div>{children}</div>
    </Popover>
  );
};

export default SnippetInfoToolTip;
