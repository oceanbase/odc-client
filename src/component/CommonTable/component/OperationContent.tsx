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

import { Button, Dropdown, Space, Tooltip } from 'antd';
import React from 'react';
import styles from '../index.less';
import type { IOperationContent, IOperationOption, ITableLoadOptions } from '../interface';
import { IOperationOptionType } from '../interface';

interface IOperationItemProps {
  option: IOperationOption;
  onClick: (fn: (args?: ITableLoadOptions) => void) => void;
}
const OperationItem: React.FC<IOperationItemProps> = ({ option, onClick }) => {
  const { type, content, icon = null, isPrimary, overlay, disabled = false } = option;
  let operation = null;
  switch (type) {
    case IOperationOptionType.icon:
      operation = (
        <a
          onClick={() => {
            onClick(option?.onClick);
          }}
          className={styles.op}
        >
          {content}
        </a>
      );
      break;
    case IOperationOptionType.dropdown:
      operation = (
        <Dropdown trigger={['click']} disabled={disabled} overlay={overlay} placement="bottomRight">
          {content}
        </Dropdown>
      );
      break;
    default:
      operation = (
        <Button
          type={isPrimary ? 'primary' : 'default'}
          disabled={disabled}
          icon={icon}
          onClick={() => {
            onClick(option?.onClick);
          }}
        >
          {content}
        </Button>
      );
  }
  return operation;
};

interface IProps extends IOperationContent {
  onClick: (fn: (args?: ITableLoadOptions) => void) => void;
}

export const OperationContent: React.FC<IProps> = (props) => {
  const { options, onClick } = props;

  return (
    <Space className={styles.operationContent} size={16}>
      {options
        .filter(({ visible = true }) => visible)
        .map((item, i) => {
          const { tooltip = null, type, render, otherContent } = item;
          return (
            <Tooltip title={tooltip} key={i}>
              {type === IOperationOptionType.custom ? (
                render?.()
              ) : (
                <Space>
                  <OperationItem option={item} onClick={onClick} />
                  {otherContent && (
                    <div style={{ color: 'var(--neutral-black45-color)' }}>{otherContent}</div>
                  )}
                </Space>
              )}
            </Tooltip>
          );
        })}
    </Space>
  );
};
