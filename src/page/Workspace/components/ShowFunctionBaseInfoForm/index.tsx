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

import ObjectInfoView from '@/component/ObjectInfoView';
import type { IFunction } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Component } from 'react';

interface IProps {
  model: Partial<IFunction>;
}

class ShowFunctionBaseInfoForm extends Component<IProps> {
  public render() {
    const { model } = this.props;

    return (
      <ObjectInfoView
        data={[
          {
            label: formatMessage({
              id: 'odc.components.ShowFunctionBaseInfoForm.FunctionName',
              defaultMessage: '函数名称',
            }), // 函数名称
            content: model.funName,
          },

          {
            label: formatMessage({
              id: 'odc.components.ShowFunctionBaseInfoForm.ResponseType',
              defaultMessage: '返回类型',
            }), // 返回类型
            content: model.returnType,
          },

          {
            label: formatMessage({
              id: 'odc.components.ShowFunctionBaseInfoForm.Founder',
              defaultMessage: '创建人',
            }), // 创建人
            content: model.definer,
          },

          model.createTime > 0
            ? {
                label: formatMessage({
                  id: 'odc.components.ShowFunctionBaseInfoForm.Created',
                  defaultMessage: '创建时间',
                }), // 创建时间
                content: getLocalFormatDateTime(model.createTime),
              }
            : null,
          model.modifyTime > 0
            ? {
                label: formatMessage({
                  id: 'odc.components.ShowFunctionBaseInfoForm.LastModifiedTime',
                  defaultMessage: '最近修改时间',
                }), // 最近修改时间
                content: getLocalFormatDateTime(model.modifyTime),
              }
            : null,
        ].filter(Boolean)}
      />
    );
  }
}

export default ShowFunctionBaseInfoForm;
