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

          model.externalResourceProperties?.file
            ? {
                label: formatMessage({
                  id: 'src.page.Workspace.components.ShowFunctionBaseInfoForm.550BBAE9',
                  defaultMessage: '资源来源',
                }),
                content: model.externalResourceProperties.file,
              }
            : null,
          model.externalResourceProperties?.createType
            ? {
                label: formatMessage({
                  id: 'src.page.Workspace.components.ShowFunctionBaseInfoForm.2D7277DB',
                  defaultMessage: '资源类型',
                }),
                content: model.externalResourceProperties.createType,
              }
            : null,
          model.externalResourceProperties?.inner_type
            ? {
                label: formatMessage({
                  id: 'src.page.Workspace.components.ShowFunctionBaseInfoForm.55808BBB',
                  defaultMessage: '内置类型',
                }),
                content: model.externalResourceProperties.inner_type,
              }
            : null,
          model.externalResourceProperties?.language
            ? {
                label: formatMessage({
                  id: 'src.page.Workspace.components.ShowFunctionBaseInfoForm.1C7B985F',
                  defaultMessage: '语言',
                }),
                content: model.externalResourceProperties.language,
              }
            : null,
          model.externalResourceProperties?.symbol
            ? {
                label: formatMessage({
                  id: 'src.page.Workspace.components.ShowFunctionBaseInfoForm.025CEE6A',
                  defaultMessage: '入口类',
                }),
                content: model.externalResourceProperties.symbol,
              }
            : null,

          model.externalResourceProperties?.createType
            ? {
                label: formatMessage({
                  id: 'src.page.Workspace.components.ShowFunctionBaseInfoForm.5910949F',
                  defaultMessage: '资源类型',
                }),
                content: model.externalResourceProperties.createType,
              }
            : null,

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
