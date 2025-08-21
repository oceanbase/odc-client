import { formatMessage } from '@/util/intl';
import { action, observable, computed, reaction, runInAction } from 'mobx';
import { ChatStatus, ChatReq, ChatFeedbackResult, ChatConversation } from '@/d.ts/chat';
import { generateUniqKey } from '@/util/utils';
import {
  listChatConversations,
  sendChatMessage,
  submitChatFeedback,
  getChatOutput,
  terminateChat,
  ChatFeedbackReq,
  getConversationMessages,
} from '@/common/network/chat';
import { ConnectionMode } from '@/d.ts/datasource';
import { AIQuestionType } from '@/d.ts/ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: any;
  chatId?: number;
  conversationId?: string;
  status?: 'loading' | 'success' | 'error' | 'terminated';
  stages?: Array<{ [key: string]: string }>; // 阶段分析过程，如[{'recognizing intent': '3s'}, {'output stram': '3s'}]
  feedbackResult?: ChatFeedbackResult;
  databaseId?: number;
  databaseName?: string;
  dialectType?: ConnectionMode;
  reference?: string[];
  chatType?: AIQuestionType;
}

/**
 * 本地会话信息
 */
interface LocalConversation {
  id: string;
  title: string;
  createTime: number;
}

export class CopilotStore {
  /**
   * Copilot 面板是否显示
   */
  @observable
  public isVisible: boolean = false;

  /**
   * 当前激活的会话ID，本地前端标识
   */
  @observable
  public activeConversationId: string = '';

  /**
   * 所有会话列表
   */
  @observable
  public conversations: Map<string, ChatMessage[]> = new Map();

  /**
   * 历史会话列表
   */
  @observable
  public historyConversations: ChatConversation[] = [];

  /**
   * 本地会话记录，存储前端创建但尚未发送到后端的会话
   */
  @observable
  public localConversations: Map<string, LocalConversation> = new Map();

  /**
   * 正在发送消息
   */
  @observable
  public isSendingMessage: boolean = false;

  /**
   * 正在生成回复
   */
  @observable
  public isGenerating: boolean = false;

  /**
   * 正在加载历史会话列表
   */
  @observable
  public isLoadingHistoryConversations: boolean = false;

  /**
   * 正在加载历史消息
   */
  @observable
  public isLoadingConversationMessages: boolean = false;

  /**
   * 代码块列表
   */
  @observable
  public codeBlocks: string[] = [];

  /**
   * 输入框默认值
   */
  @observable
  public defaultContent: string = '';

  /**
   * 输入框选择的数据库
   */
  @observable
  public defaultSelectedDatabaseId: string = null;

  /**
   * 指令默认值
   */
  @observable
  public defaultChatType: AIQuestionType = null;

  /**
   * 轮询定时器ID
   */
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    reaction(
      () => this.isVisible,
      (isVisible) => {
        if (isVisible && !this.activeConversationId) {
          this.createNewConversation();
        }
      },
    );
  }

  /**
   * 添加代码块
   */
  @action
  public addCodeBlock = (code: string): void => {
    // 去掉重复codeblock
    const existingIndex = this.codeBlocks.findIndex((block) => block === code);
    if (existingIndex !== -1) {
      this.codeBlocks.splice(existingIndex, 1);
    }
    this.codeBlocks.push(code);
  };

  /**
   * 更新代码块
   */
  @action
  public updateCodeBlock = (codeblocks): void => {
    this.codeBlocks = codeblocks;
  };

  /**
   * 清空所有代码块
   */
  @action
  public clearCodeBlocks = (): void => {
    this.codeBlocks = [];
  };

  /**
   * 设置默认的输入内容
   */
  @action
  public updateDefaultContent = (code: string): void => {
    this.defaultContent = code;
  };

  /**
   * 设置默认选中的数据库
   */
  @action
  public updateDefaultSelectedDatabaseId = (id: string): void => {
    this.defaultSelectedDatabaseId = id;
  };

  /**
   * 设置默认选中的指令
   */
  @action
  public updateDefaultChatType = (type: AIQuestionType | null): void => {
    this.defaultChatType = type;
  };

  /**
   * 清除状态
   */
  @action
  public clearState = () => {
    this.updateDefaultContent(null);
    this.updateDefaultSelectedDatabaseId(null);
    this.updateDefaultChatType(null);
    this.clearCodeBlocks();
  };
  /**
   * 切换Copilot面板显示状态
   */
  @action
  public toggleVisibility = (visible?: boolean): void => {
    if (visible) {
      this.isVisible = visible;
      return;
    }
    this.isVisible = !this.isVisible;
  };

  /**
   * 创建新会话
   */
  @action
  public createNewConversation = (): void => {
    const conversationId = generateUniqKey('conversation');
    this.activeConversationId = conversationId;
    this.conversations.set(conversationId, []);

    // 将新会话添加到本地会话记录
    this.localConversations.set(conversationId, {
      id: conversationId,
      title: formatMessage({ id: 'src.store.FD92E696', defaultMessage: '新会话' }),
      createTime: Date.now(),
    });
  };

  /**
   * 加载历史会话列表
   */
  @action
  public loadHistoryConversations = async (): Promise<void> => {
    try {
      this.isLoadingHistoryConversations = true;
      const conversations = await listChatConversations();
      const localConversationsArray: ChatConversation[] = Array.from(
        this.localConversations.values(),
      );
      runInAction(() => {
        // 合并后端会话和本地会话
        this.historyConversations = [...localConversationsArray, ...conversations];
        this.isLoadingHistoryConversations = false;
      });
    } catch (error) {
      console.error('Failed to Load History:', error);
      runInAction(() => {
        this.isLoadingHistoryConversations = false;
      });
    }
  };

  /**
   * 获取并转换会话详情
   */
  private async getAndTransformConversationMessages(
    conversationId: string,
    needLoading: boolean = true,
  ): Promise<ChatMessage[]> {
    // 检查是否为本地会话，且没有后端ID
    const localConv = this.localConversations.get(conversationId);
    if (localConv) {
      return this.conversations.get(conversationId) || [];
    }
    if (needLoading) {
      this.isLoadingConversationMessages = true;
    }
    // 否则从后端获取消息
    const chatHistory = await getConversationMessages(conversationId);
    const messages: ChatMessage[] = [];
    chatHistory.forEach((chat) => {
      // 用户消息
      const userMsg: ChatMessage = {
        id: `${chat.id?.toString?.()}-user`,
        role: 'user',
        content: chat.input,
        chatId: chat.id,
        conversationId: chat.conversationId,
        status: 'success',
        databaseId: chat.databaseId,
        databaseName: chat.databaseName,
        dialectType: chat.dialectType,
        reference: chat?.reference,
        chatType: chat?.chatType,
      };
      messages.push(userMsg);
      // ai回复
      const assistantMsg: ChatMessage = {
        id: `${chat.id?.toString?.()}-assistant`,
        role: 'assistant',
        content: chat.output || '',
        chatId: chat.id,
        conversationId: chat.conversationId,
        status: this.getStatusLabel(chat.status),
        feedbackResult: chat.feedbackResult,
        stages: chat.stages,
        databaseId: chat.databaseId,
        databaseName: chat.databaseName,
        dialectType: chat.dialectType,
      };
      messages.push(assistantMsg);
    });
    this.isLoadingConversationMessages = false;
    return messages;
  }

  /**
   * 选择历史会话
   */
  @action
  public selectHistoryConversation = async (conversationId: string): Promise<void> => {
    if (this.activeConversationId && this.activeConversationId !== conversationId) {
      this.conversations.delete(this.activeConversationId);
    }

    this.activeConversationId = conversationId;
    try {
      const messages = await this.getAndTransformConversationMessages(conversationId);
      runInAction(() => {
        this.conversations.set(conversationId, messages);
      });
    } catch (error) {
      console.error('Failed To Load History:', error);
    }
  };

  /**
   * 添加消息到当前会话
   */
  @action
  public addMessageToActiveConversation = (message: ChatMessage): void => {
    if (!this.activeConversationId) return;

    const messages = this.conversations.get(this.activeConversationId) || [];
    messages.push(message);
    this.conversations.set(this.activeConversationId, messages);
  };

  /**
   * 发送用户消息
   */
  @action
  public sendMessage = async (
    input: string,
    chatType?: AIQuestionType,
    databaseId?: number,
    databaseName?: string,
    dialectType?: ConnectionMode,
    sessionId?: string,
    reference?: string[],
  ): Promise<void> => {
    if (!this.activeConversationId || !input.trim()) return;
    this.isSendingMessage = true;

    const userMessageId = generateUniqKey('user-msg');
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: input,
      status: 'loading',
      reference,
      databaseName,
      databaseId,
      chatType,
      dialectType,
    };
    this.addMessageToActiveConversation(userMessage);

    const chatReq: ChatReq = {
      input,
      chatType: chatType,
      conversationId: this.getBackendConversationId(),
      databaseId,
      databaseName,
      dialectType,
      sessionId,
      reference,
      obCloudOrganizationName: window._odc_params?.getOrgProjectName?.()?.obCloudOrganizationName,
      obCloudProjectName: window._odc_params?.getOrgProjectName?.()?.obCloudProjectName,
    };

    const response = await sendChatMessage(chatReq);
    if (response) {
      runInAction(() => {
        const messages = this.conversations.get(this.activeConversationId) || [];
        const userMsgIndex = messages.findIndex((msg) => msg.id === userMessageId);
        if (userMsgIndex >= 0) {
          messages[userMsgIndex].chatId = response.id;
          messages[userMsgIndex].id = `${response.id}-user`;
          messages[userMsgIndex].conversationId = response.conversationId;
          messages[userMsgIndex].status = 'success';
        }

        // 更新当前会话ID为后端返回的会话ID
        if (this.localConversations.get(this.activeConversationId)) {
          this.localConversations.delete(this.activeConversationId);
          this.conversations.delete(this.activeConversationId);
          this.loadHistoryConversations();
        }
        this.activeConversationId = response.conversationId;

        const assistantMessage: ChatMessage = {
          id: response.id?.toString?.(),
          role: 'assistant',
          content: '',
          chatId: response.id,
          conversationId: response.conversationId,
          status: 'loading',
          databaseId,
          databaseName,
          dialectType,
        };
        this.conversations.set(response.conversationId, [...messages, assistantMessage]);
        this.startPolling(response.id as number, response.id?.toString?.());
        this.isSendingMessage = false;
        this.isGenerating = true;
      });
    } else {
      runInAction(() => {
        const messages = this.conversations.get(this.activeConversationId) || [];
        const userMsgIndex = messages.findIndex((msg) => msg.id === userMessageId);
        if (userMsgIndex >= 0) {
          messages[userMsgIndex].status = 'error';
        }
        this.isSendingMessage = false;
        this.isGenerating = false;
      });
    }
  };

  /**
   * 开始轮询获取回复
   */
  private startPolling = (chatId: number, messageId: string): void => {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
    let accumulatedContent = '';
    this.pollingTimer = setInterval(async () => {
      try {
        const chat = await getChatOutput(chatId);

        runInAction(() => {
          if (!this.activeConversationId) return;

          const messages = this.conversations.get(this.activeConversationId) || [];
          const msgIndex = messages.findIndex((msg) => msg.id === messageId);

          if (msgIndex >= 0) {
            if (chat.output && chat.output.trim() !== '') {
              accumulatedContent += chat.output;
            }
            messages[msgIndex].content = accumulatedContent;
            if (chat.stages) {
              messages[msgIndex].stages = chat.stages;
            }
            messages[msgIndex].status = this.getStatusLabel(chat.status);
            if (chat.status !== ChatStatus.IN_PROGRESS) {
              this.stopPolling();
              this.isGenerating = false;
            }
          }
        });
      } catch (error) {
        console.error('Failed To Get AIMessage:', error);
        this.stopPolling();
        runInAction(() => {
          this.isGenerating = false;
        });
      }
    }, 500);
  };

  /**
   * 停止轮询
   */
  @action
  public stopPolling = (): void => {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isGenerating = false;
  };

  /**
   * 停止生成回复
   */
  @action
  public stopGenerating = async (): Promise<void> => {
    if (!this.activeConversationId || !this.isGenerating) return;

    const messages = this.conversations.get(this.activeConversationId) || [];
    const assistantMsg = messages.find(
      (msg) => msg.role === 'assistant' && msg.status === 'loading',
    );

    if (assistantMsg && assistantMsg.chatId) {
      try {
        await terminateChat(assistantMsg.chatId);
      } catch (error) {
        console.error('Failed To Stop:', error);
      }
    }
  };

  /**
   * 获取后端会话ID
   * 如果当前会话没有后端会话ID，则返回undefined
   */
  private getBackendConversationId = (): string | undefined => {
    if (!this.activeConversationId) return undefined;
    const messages = this.conversations.get(this.activeConversationId) || [];
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].conversationId) {
        return messages[i].conversationId;
      }
    }

    return undefined;
  };

  private getStatusLabel = (status: ChatStatus): 'success' | 'error' | 'terminated' | 'loading' => {
    const map: Record<ChatStatus, string> = {
      [ChatStatus.COMPLETED]: 'success',
      [ChatStatus.FAILED]: 'error',
      [ChatStatus.CANCELED]: 'terminated',
      [ChatStatus.IN_PROGRESS]: 'loading',
    };

    return map[status] as 'loading' | 'success' | 'error' | 'terminated';
  };

  /**
   * 提交反馈
   */
  @action
  public submitFeedback = async (
    chatId: number,
    result: ChatFeedbackResult,
    content?: string,
  ): Promise<void> => {
    try {
      const feedbackReq: ChatFeedbackReq = {
        chatId,
        feedbackResult: result,
        feedbackContent: content,
      };
      await submitChatFeedback(chatId, feedbackReq);

      // 重新获取会话详情
      if (this.activeConversationId) {
        const messages = await this.getAndTransformConversationMessages(
          this.activeConversationId,
          false,
        );
        runInAction(() => {
          this.conversations.set(this.activeConversationId, messages);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 检查会话是否为最新会话
   */
  public isLatestConversation = (conversationId: string): boolean => {
    if (this.localConversations.get(conversationId)) {
      return true;
    }
    const sortedHistoryConversations = [...this.historyConversations].sort(
      (a, b) => Number(b.createTime) - Number(a.createTime),
    );

    return (
      sortedHistoryConversations.length > 0 && sortedHistoryConversations[0].id === conversationId
    );
  };

  /**
   * 获取当前活动会话的消息
   */
  @computed
  public get activeConversationMessages(): ChatMessage[] {
    return this.activeConversationId ? this.conversations.get(this.activeConversationId) || [] : [];
  }
}

const copilotStore = new CopilotStore();
export default copilotStore;
