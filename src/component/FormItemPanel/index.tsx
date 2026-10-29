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
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import React from 'react';

import styles from './index.less';

interface IProps {
  label?: React.ReactNode;
  overview?: React.ReactNode;
  expandText?: string;
  expand?: boolean;
  /**
   * 展开panel，没有按钮展开缩起
   */
  keepExpand?: boolean;
  noPaddingBottom?: boolean;
  onExpandChange?: (isExpand: boolean) => void;
  customExtra?: React.ReactNode;
}

const FormItemPanel: React.FC<IProps> = function (props) {
  const {
    overview,
    label,
    children,
    expandText,
    keepExpand,
    noPaddingBottom = false,
    customExtra = null,
  } = props;
  const [expand, setExpand] = useControllableValue<boolean>(props, {
    defaultValue: false,
    valuePropName: 'expand',
    trigger: 'onExpandChange',
  });

  const iconStyle = {
    marginLeft: '4px',
    fontSize: 14,
  };

  return (
    <div>
      {label ? (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          {!keepExpand ? (
            <a
              onClick={() => {
                setExpand(!expand);
              }}
              className={styles.expandBtn}
            >
              {
                expandText ||
                  formatMessage({
                    id: 'odc.component.FormItemPanel.Superior',
                    defaultMessage: '高级',
                  }) // 高级
              }
              {expand ? <UpOutlined style={iconStyle} /> : <DownOutlined style={iconStyle} />}
            </a>
          ) : (
            customExtra
          )}
        </div>
      ) : null}
      <div
        style={{
          background: 'var(--background-tertraiy-color)',
          padding: '11px 12px 8px 12px',
          paddingBottom: noPaddingBottom ? '0px' : '8px',
          margin: '0px 0px 16px 0px',
        }}
      >
        <div>{overview}</div>
        <div style={{ display: expand || keepExpand ? 'unset' : 'none' }}>{children}</div>
      </div>
    </div>
  );
};

export default FormItemPanel;
