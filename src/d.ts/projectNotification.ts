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
// 事件状态
export enum EEventType {
  CREATED = 'CREATED',
  CONVERTING = 'CONVERTING',
  THROWN = 'THROWN',
  CONVERTED = 'CONVERTED',
}
// 消息发送状态
export enum EMessageStatus {
  // 待发送
  CREATED = 'CREATED',
  // 发送成功
  SENT_SUCCESSFULLY = 'SENT_SUCCESSFULLY',
  // 发送失败
  SENT_FAILED = 'SENT_FAILED',
  // 忽略
  THROWN = 'THROWN',
  // 发送中
  SENDING = 'SENDING',
}
// 限流时间单位
export enum ETimeUnit {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
}
// #region ------------------------- notification channel -------------------------
// 通道类型
export enum EChannelType {
  // 钉钉
  DING_TALK = 'DingTalk',
  // 飞书
  FEI_SHU = 'Feishu',
  // 企业微信
  WE_COM = 'WeCom',
  // 自定义webhook
  WEBHOOK = 'Webhook',
}
// 限流策略
export enum EOverLimitStrategy {
  // 丢弃, UI中文本为忽略
  THROWN = 'THROWN',
  // 重发
  RESEND = 'RESEND',
}
export const EOverLimitStrategyMap = {
  [EOverLimitStrategy.THROWN]: formatMessage({ id: 'src.d.ts.C34AA00A' }), //'忽略'
  [EOverLimitStrategy.RESEND]: formatMessage({ id: 'src.d.ts.01B0FD39' }), //'重发'
};
export const EOverLimitStrategyTipMap = {
  [EOverLimitStrategy.THROWN]: formatMessage({ id: 'src.d.ts.88D96CF0' }), //'忽略已超出限流的消息，不再重发'
  [EOverLimitStrategy.RESEND]: formatMessage({ id: 'src.d.ts.38B0347B' }), //'限流时间过后，将自动重发超出限流的消息'
};
export interface IRateLimitConfig {
  timeUnit: ETimeUnit;
  limit: number;
  overLimitStrategy: EOverLimitStrategy;
}
export enum ELanguage {
  ZH_CN = 'zh-CN',
  ZH_TW = 'zh-TW',
  EN_US = 'en-US',
}
export interface IBasChannelConfig {
  /** @description 通道 webhook地址 */
  webhook: string;
  /** @description 通道 标题模版 */
  titleTemplate?: string;
  /** @description 通道 内容模版 */
  contentTemplate: string;
  /** @description 通道 限流配置 */
  rateLimitConfig: IRateLimitConfig;
  /** @description 通道 模版语言 */
  language: ELanguage;
}
interface WebhookConfig extends IBasChannelConfig {
  /** @description 通道 自定义WebHook 请求方法 */
  httpMethod: string;
  /** @description 通道 自定义WebHook 代理 */
  httpProxy: string;
  /** @description 通道 自定义WebHook Headers */
  headersTemplate?: string;
  /** @description 通道 自定义WebHook Body */
  bodyTemplate?: string;
  /** @description 通道 自定义WebHook Response */
  responseValidation: string;
}
interface DingTalkConfig extends IBasChannelConfig {
  /** @description 通道 webhook指定用户手机号 */
  atMobiles?: string[];
  /** @description 通道 签名密钥 */
  sign?: string;
}
interface FeishuConfig extends IBasChannelConfig {
  /** @description 通道 签名密钥 */
  sign?: string;
}
interface WeComConfig extends IBasChannelConfig {
  /** @description 通道 webhook指定用户手机号 */
  atMobiles?: string[];
}
type ChannelConfigMap<T extends EChannelType> = T extends EChannelType.DING_TALK
  ? DingTalkConfig
  : T extends EChannelType.WE_COM
  ? WeComConfig
  : T extends EChannelType.FEI_SHU
  ? FeishuConfig
  : WebhookConfig;
export interface IChannel<T extends EChannelType> {
  /** @description 通道 通道ID */
  id?: number;
  /** @description 通道名称 */
  name: string;
  /** @description 通道创建时间 */
  createTime?: number;
  /** @description 通道更新时间 */
  updateTime?: number;
  /** @description 通道创建者ID */
  creatorId: number;
  /** @description 通道创建者用户名 */
  creatorName: string;
  /** @description 通道创建者所属组织ID */
  organizationId: number;
  /** @description 通道所属项目ID */
  projectId: number;
  /** @description 通道 类型 */
  type: T;
  /** @description 通道 属性 */
  channelConfig: ChannelConfigMap<T>;
  /** @description 通道 描述 */
  description?: string;
}

export interface ITestChannelResult {
  active: boolean;
  errorMessage: string;
}
// #endregion

// #region ------------------------- notification policy -------------------------
export interface IPolicy {
  id?: number;
  createTime?: number;
  updateTime?: number;
  creatorId: number;
  organizationId: number;
  projectId: number;
  policyMetadataId?: number;
  matchExpression: string;
  enabled: boolean;
  channels: IChannel<EChannelType>[];
  eventName: string;
}
export type TBatchUpdatePolicy = {
  id?: number;
  policyMetadataId?: number;
  enabled?: boolean;
  channels: Pick<IChannel<EChannelType>, 'id'>[];
};
// #endregion

// #region ------------------------- notification message -------------------------
export interface IMessage {
  id?: number;
  createTime?: number;
  creatorId: number;
  organizationId: number;
  projectId: number;
  status: EMessageStatus;
  retryTimes: number;
  errorMessage: string;
  channel: IChannel<EChannelType>;
  lastSentTime?: number;
  title: string;
  content: string;
}
// #endregion
