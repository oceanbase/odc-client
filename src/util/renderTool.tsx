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

import { Popconfirm } from 'antd';
import Action from '@/component/Action';
import { IOperation } from '@/d.ts/operation';

export const renderTool = (tool: IOperation, index) => {
  if (tool.hasOwnProperty('visible') && !tool?.visible) return null;
  if (tool?.confirmText) {
    return (
      <Popconfirm key={tool?.key || index} title={tool?.confirmText} onConfirm={tool?.action}>
        <Action.Link
          key={tool?.key || index}
          disabled={tool?.disable}
          tooltip={tool?.disableTooltip()}
        >
          {tool?.text}
        </Action.Link>
      </Popconfirm>
    );
  }
  return (
    <Action.Link
      key={tool?.key || index}
      disabled={tool?.disable}
      tooltip={tool?.disableTooltip()}
      onClick={tool?.action}
    >
      {tool?.text}
    </Action.Link>
  );
};
