import request from '@/util/request';
import { Chat, ChatConversation, ChatReq } from '@/d.ts/chat';

export interface ChatFeedbackReq {
  chatId: number;
  feedbackResult: 'SATISFIED' | 'UNSATISFIED';
  feedbackContent?: string;
}

/**
 * 创建聊天会话
 */
export async function createChatConversation(chatReq: ChatReq): Promise<Chat> {
  const ret = await request.post('/api/v2/chat/conversations', {
    data: chatReq,
  });
  return ret?.data;
}

/**
 * 获取聊天会话列表
 */
export async function listChatConversations(limit = 10): Promise<ChatConversation[]> {
  const ret = await request.get(`/api/v2/copilot/chats/conversations?limit=${limit}`);
  return ret?.data?.contents?.reverse();
}

/**
 * 获取指定会话的所有聊天记录
 * @param conversationId
 * @returns 聊天记录数组
 */
export async function getConversationMessages(
  conversationId: string,
  page = 1,
  size = 9999,
): Promise<Chat[]> {
  const ret = await request.get(
    `/api/v2/copilot/chats?conversationId=${conversationId}&page=${page}&size=${size}`,
  );
  return ret?.data?.contents?.reverse();
}

/**
 * 发送聊天消息
 * @param chatReq
 */
export async function sendChatMessage(chatReq: ChatReq): Promise<Chat> {
  const ret = await request.post(`/api/v2/copilot/chats/`, {
    data: chatReq,
  });
  return ret?.data;
}

/**
 * 提交聊天反馈
 */
export async function submitChatFeedback(
  chatId: number,
  feedbackReq: ChatFeedbackReq,
): Promise<Chat> {
  const ret = await request.patch(`/api/v2/copilot/chats/${chatId}/feedback`, {
    data: feedbackReq,
  });
  return ret?.data;
}

/**
 * 获取聊天输出
 * @param chatId
 */
export async function getChatOutput(chatId: number): Promise<Chat> {
  const ret = await request.get(`/api/v2/copilot/chats/${chatId}/output`);
  return ret?.data;
}

/**
 * 终止聊天
 */
export async function terminateChat(chatId: number): Promise<Chat> {
  const ret = await request.post(`/api/v2/copilot/chats/${chatId}/terminate`);
  return ret?.data;
}
