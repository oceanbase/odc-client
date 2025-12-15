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

import { ConnectionMode } from '@/d.ts/datasource';
import { AIQuestionType } from './ai';

export enum ChatFeedbackResult {
  SATISFIED = 'SATISFIED',
  UNSATISFIED = 'UNSATISFIED',
}

export enum ChatStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export interface ChatReq {
  /**
   * 用户输入
   */
  input: string;
  /**
   * 引用内容
   */
  reference?: string[];
  /**
   * 指令类型
   */
  chatType?: AIQuestionType;
  /**
   * 会话ID（对于第一条消息可以不填，服务器会创建新会话）
   */
  conversationId?: string;
  /**
   * 数据库ID
   */
  databaseId?: number;
  /**
   * 数据库名
   */
  databaseName?: string;
  /**
   * 数据源类型
   */
  dialectType?: ConnectionMode;
  /**
   * ODC 的 sessionId
   */
  sessionId?: string;
  /**
   * 组织名
   */
  obCloudOrganizationName?: string;
  /**
   * 项目名
   */
  obCloudProjectName?: string;
  /**
   * 阶段(分析过程)
   */
  stages?: Array<{ [key: string]: string }>;
}

export interface Chat {
  /**
   * Id for chat copilot
   */
  id?: number;
  /**
   * Record insertion time
   */
  createTime?: Date;
  /**
   * Record modification time
   */
  updateTime?: Date;
  /**
   * reference to connect_database.id
   */
  databaseId?: number;
  /**
   * 数据源类型
   */
  dialectType?: ConnectionMode;
  /**
   * creator user id, references iam_user.id
   */
  creatorId: number;
  /**
   * 会话ID
   */
  conversationId: string;
  /**
   * 指令类型
   */
  chatType?: AIQuestionType;
  /**
   * 引用内容
   */
  reference?: string[];
  /**
   * 用户的输入的原文本
   */
  input: string;
  /**
   * copilot 针对用户问题的回答
   */
  output?: string;
  /**
   * 用户反馈的结果，赞/踩
   */
  feedbackResult?: ChatFeedbackResult;
  /**
   * 用户反馈的原文本
   */
  feedbackContent?: string;
  /**
   * 状态：完成/异常/输出中/终止
   */
  status: ChatStatus;
  /**
   * 状态为异常时的报错信息
   */
  errorMessage?: string;
  /**
   * 阶段分析过程
   * 示例: [
   *  {"recognizing intent": "3s"},
   *  {"planning": "5s"},
   *  {"searching": "7s"},
   *  {"generating response": "4s"}
   * ]
   */
  stages?: Array<{ [key: string]: string }>;
  /**
   * 数据库名称
   */
  databaseName?: string;
}

export interface ChatConversation {
  /**
   * 会话ID
   */
  id: string;
  /**
   * 会话标题
   */
  title: string;
  /**
   * 会话创建时间
   */
  createTime: number;
  /**
   * 组织名
   */
  obCloudOrganizationName?: string;
  /**
   * 项目名
   */
  obCloudProjectName?: string;
}
