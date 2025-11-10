import React from 'react';

import { Input, Select } from 'antd';

import { formatMessage, getServerLocalKey } from '@/util/intl';

import { ESchemaFieldType, EConfigurationMethod, IModelProvider } from '@/d.ts/llm';

import { TEXT_CONSTANTS, UI_COLORS } from '@/constant/llm';

// 生成表单组件的辅助函数
export const renderFormComponent = (schema: any) => {
  const { type, placeholder, options } = schema;
  const key = getServerLocalKey();
  switch (type) {
    case ESchemaFieldType.SECRET_INPUT:
      return (
        <Input.Password
          placeholder={
            placeholder?.[key] ||
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.utils.99DEC505',
              defaultMessage: '请输入',
            })
          }
        />
      );
    case ESchemaFieldType.TEXT_INPUT:
      return (
        <Input
          placeholder={
            placeholder?.[key] ||
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.utils.A29C4AAC',
              defaultMessage: '请输入',
            })
          }
        />
      );
    case ESchemaFieldType.SELECT:
      return (
        <Select
          placeholder={
            placeholder?.[key] ||
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.utils.F3184B73',
              defaultMessage: '请选择',
            })
          }
        >
          {options?.map((option: any) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label?.[key] || option.value}
            </Select.Option>
          ))}
        </Select>
      );

    default:
      return (
        <Input
          placeholder={
            placeholder?.[key] ||
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.utils.F2D0D42C',
              defaultMessage: '请输入',
            })
          }
        />
      );
  }
};

/**
 * 阻止事件冒泡的通用处理器
 */
export const stopPropagation = (callback: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  callback();
};

/**
 * 设置当前Provider并执行回调
 */
export const withProviderAction = (
  provider: IModelProvider | undefined,
  largeModelStore,
  action: (store) => void,
) => {
  if (provider && largeModelStore) {
    largeModelStore.setCurrentProvider(provider);
    action(largeModelStore);
  }
};

/**
 * 获取API Key按钮文案
 */
export const getApiKeyButtonText = (hasApiKey: boolean): string => {
  return hasApiKey ? TEXT_CONSTANTS.MODIFY_API_KEY : TEXT_CONSTANTS.CONFIGURE_API_KEY;
};

/**
 * 获取状态点颜色
 */
export const getStatusDotColor = (hasApiKey: boolean): string => {
  return hasApiKey ? UI_COLORS.SUCCESS_GREEN : UI_COLORS.ERROR_RED;
};

/**
 * 检查是否支持某个配置方法
 */
export const supportsConfigurationMethod = (
  provider: IModelProvider | undefined,
  method: EConfigurationMethod,
): boolean => {
  return provider?.configurateMethods?.includes(method) || false;
};

/**
 * 格式化模型数量显示
 */
export const formatModelCount = (count: number): string => {
  return formatMessage(
    {
      id: 'src.page.ExternalIntegration.LargeModel.utils.6D8AD4F6',
      defaultMessage: '{count} 个模型',
    },
    { count },
  );
};

/**
 * 创建状态点样式对象
 */
export const createStatusDotStyle = (hasApiKey: boolean): React.CSSProperties => ({
  backgroundColor: getStatusDotColor(hasApiKey),
});
