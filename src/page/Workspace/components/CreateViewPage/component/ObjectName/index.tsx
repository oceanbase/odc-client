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

import React, { useEffect, useState } from 'react';
import { ReactComponent as ViewSvg } from '@/svgr/View.svg';
import Icon, { DatabaseOutlined, TableOutlined } from '@ant-design/icons';

export const ICON_DATABASE = <DatabaseOutlined style={{ color: ' #9d7ac7' }} />;
export const ICON_TABLE = <TableOutlined style={{ color: '#3FA3FF' }} />;
export const ICON_VIEW = <Icon type="view" component={ViewSvg} style={{ color: '#FA8C15' }} />;
interface IProps {
  title: any;
  type: EnumObjectType;
}

export enum EnumObjectType {
  TABLE = 'TABLE',
  VIEW = 'VIEW',
}

const EditableText: React.FC<IProps> = React.memo((props) => {
  if (props.type === EnumObjectType.TABLE) {
    return (
      <span>
        {ICON_TABLE}&nbsp;&nbsp;{props.title}
      </span>
    );
  }
  if (props.type === EnumObjectType.VIEW) {
    return (
      <span>
        {ICON_VIEW}&nbsp;&nbsp;{props.title}
      </span>
    );
  }
  return <span>{props.title}</span>;
});

export default EditableText;
