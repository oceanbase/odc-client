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
            }), // 函数名称
            content: model.funName,
          },

          {
            label: formatMessage({
              id: 'odc.components.ShowFunctionBaseInfoForm.ResponseType',
            }), // 返回类型
            content: model.returnType,
          },

          {
            label: formatMessage({
              id: 'odc.components.ShowFunctionBaseInfoForm.Founder',
            }), // 创建人
            content: model.definer,
          },

          model.createTime > 0
            ? {
                label: formatMessage({
                  id: 'odc.components.ShowFunctionBaseInfoForm.Created',
                }), // 创建时间
                content: getLocalFormatDateTime(model.createTime),
              }
            : null,
          model.modifyTime > 0
            ? {
                label: formatMessage({
                  id: 'odc.components.ShowFunctionBaseInfoForm.LastModifiedTime',
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
