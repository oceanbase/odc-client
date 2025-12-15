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

import { ISnippet } from '@/store/snippet';
import { Popover } from 'antd';

import { formatMessage } from '@/util/intl';
import { getSnippetText } from '@/util/business/snippet';
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
            <dt className={styles['snippet-value']}>
              {
                formatMessage({
                  id: 'odc.component.SnippetCard.Syntax',
                  defaultMessage: '代码',
                }) /*代码片段*/
              }
            </dt>
            <dd>
              <pre className={styles['snippet-value']} style={{ maxHeight: 300 }}>
                {getSnippetText(snippet.body)}
              </pre>
            </dd>
            <dt>
              {
                formatMessage({
                  id: 'odc.component.SnippetCard.Description',
                  defaultMessage: '描述',
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
