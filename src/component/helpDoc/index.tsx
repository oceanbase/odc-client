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

import React from 'react';

import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { Tooltip } from 'antd';
import Doc from './doc';
import styles from './index.less';

interface IDocProps {
  doc?: string;
  title?: string;
  isTip?: boolean;
  leftText?: boolean;
  overlayStyle?: { [key: string]: string };
}

const HelpDoc: React.FC<IDocProps> = function (props) {
  const { isTip = true, leftText, overlayStyle, doc: propDoc, title } = props;
  const doc = title ? title : Doc[propDoc];
  const iconStyle = {
    margin: '0px 4px',
    color: 'var(--icon-color-normal)',
  };
  return (
    <span>
      {leftText ? props.children : null}
      <Tooltip
        overlayClassName={styles['c-helpdoc']}
        title={typeof doc === 'function' ? doc() : doc}
        overlayStyle={overlayStyle || {}}
      >
        {isTip ? (
          <QuestionCircleOutlined style={iconStyle} />
        ) : (
          <InfoCircleOutlined style={iconStyle} />
        )}
      </Tooltip>
      {!leftText ? props.children : null}
    </span>
  );
};

export default HelpDoc;
