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

import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';

import setting from '@/store/setting';
import { ReactComponent as AIDisableSvg } from '@/svgr/inlinecomplete_disabled.svg';
import { ReactComponent as AIEnableSvg } from '@/svgr/inlinecomplete_enabled.svg';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './index.less';

export default observer(function AIState() {
  const workspaceAIEnabled = setting.AIConfig.completionEnabled;
  const userAIEnabled = setting.enableAIInlineCompletion;
  if (!workspaceAIEnabled) {
    return null;
  } else if (!userAIEnabled) {
    return (
      <Tooltip
        title={formatMessage({
          id: 'src.component.AICompletionState.F398AEAD',
          defaultMessage: '智能补全',
        })}
      >
        <Icon
          onClick={() => {
            setting.enableAI();
          }}
          component={AIDisableSvg}
          className={styles.btn}
        />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip
        title={formatMessage({
          id: 'src.component.AICompletionState.2F9A6C8F',
          defaultMessage: '智能补全生效中...',
        })}
      >
        <span
          style={{
            display: 'inline-flex',
            backgroundImage: 'linear-gradient(135deg, #c766ff26 0%, #0181fd26 100%)',
            borderRadius: 4,
          }}
        >
          <Icon
            onClick={() => {
              setting.disableAI();
            }}
            component={AIEnableSvg}
            className={styles.btn}
          />
        </span>
      </Tooltip>
    );
  }
});
