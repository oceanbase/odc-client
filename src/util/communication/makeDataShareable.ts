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

import { reaction } from 'mobx';
import login from '@/store/login';
import { getCurrentOrganizationId } from '@/store/setting';

enum EShareableIdentifierType {
  USER = 'user',
  ORGANIZATION = 'organization',
}

interface IShareableOptions {
  /**
   * 共享数据的唯一标识符
   */
  channelName: string;
  /**
   * 标识符类型，决定使用userId还是organizationId进行过滤
   * - 'user': 使用 login.user?.id (默认)
   * - 'organization': 使用 getCurrentOrganizationId()
   */
  identifierType: EShareableIdentifierType;
}

/**
 * 共享数据管理器
 * 使用 BroadcastChannel 实现跨窗口的数据同步
 */
class ShareableDataManager {
  private channels = new Map<string, BroadcastChannel>();
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private channelIdentifierTypes = new Map<string, EShareableIdentifierType>();
  /**
   * 安全序列化数据，确保可以被 BroadcastChannel 克隆
   */
  private safeSerialize(data: any): any {
    try {
      // 使用 JSON 序列化和反序列化来确保数据可克隆
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.warn('[makeDataShareable] Failed to serialize data:', error);
      // 如果序列化失败，返回 null 并记录警告
      return null;
    }
  }

  /**
   * 获取或创建BroadcastChannel
   */
  private getChannel(channelName: string): BroadcastChannel {
    if (!this.channels.has(channelName)) {
      const channel = new BroadcastChannel(channelName);
      this.channels.set(channelName, channel);

      // 监听来自其他窗口/标签页的消息
      channel.addEventListener('message', (event) => {
        const { type, data, userId, organizationId } = event.data;
        if (type === 'data_update') {
          const identifierType = this.channelIdentifierTypes.get(channelName);
          if (!identifierType) {
            return;
          }
          switch (identifierType) {
            case EShareableIdentifierType.ORGANIZATION:
              // 验证organizationId匹配，确保只接收同一组织的数据
              const currentOrganizationId = getCurrentOrganizationId();
              if (currentOrganizationId && organizationId === currentOrganizationId) {
                this.notifySubscribers(channelName, data);
              } else if (currentOrganizationId) {
                // organizationId不匹配，忽略消息
                console.log(
                  `[makeDataShareable] Ignoring message from different organization. Current: ${currentOrganizationId}, Message: ${organizationId}`,
                );
              }
              break;
            case EShareableIdentifierType.USER:
              // 验证用户ID匹配，确保只接收同一用户的数据
              const currentUserId = login.user?.id;
              if (currentUserId && userId === currentUserId) {
                this.notifySubscribers(channelName, data);
              } else if (currentUserId) {
                // 用户ID不匹配，忽略消息
                console.log(
                  `[makeDataShareable] Ignoring message from different user. Current: ${currentUserId}, Message: ${userId}`,
                );
              }
              break;
            default:
              break;
          }
        }
      });
    }
    return this.channels.get(channelName)!;
  }

  /**
   * 通知订阅者
   */
  private notifySubscribers(channelName: string, newData: any) {
    const subscribers = this.subscriptions.get(channelName);
    if (subscribers) {
      subscribers.forEach((callback) => callback(newData));
    }
  }

  /**
   * 广播数据更新
   */
  public broadcastUpdate(channelName: string, data: any) {
    const channel = this.getChannel(channelName);
    const identifierType = this.channelIdentifierTypes.get(channelName);
    if (!identifierType) {
      return;
    }

    // 使用 safeSerialize 确保数据可以被安全传输
    const safeData = this.safeSerialize(data);
    if (safeData === null) {
      // 如果序列化失败，直接返回，不发送消息
      return;
    }

    const message: any = {
      type: 'data_update',
      data: safeData,
      timestamp: Date.now(),
    };

    switch (identifierType) {
      case EShareableIdentifierType.ORGANIZATION:
        message.organizationId = getCurrentOrganizationId();
        break;
      case EShareableIdentifierType.USER:
        message.userId = login.user?.id;
        break;
      default:
        break;
    }

    channel.postMessage(message);
  }

  /**
   * 订阅数据变化
   */
  public subscribe(
    channelName: string,
    callback: (data: any) => void,
    identifierType: EShareableIdentifierType = EShareableIdentifierType.USER,
  ): () => void {
    // 设置频道的标识符类型
    this.channelIdentifierTypes.set(channelName, identifierType);

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }
    this.subscriptions.get(channelName)!.add(callback);

    // 确保频道存在
    this.getChannel(channelName);

    // 返回取消订阅函数
    return () => {
      const subscribers = this.subscriptions.get(channelName);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscriptions.delete(channelName);
          this.channelIdentifierTypes.delete(channelName);
          this.closeChannel(channelName);
        }
      }
    };
  }

  /**
   * 关闭频道
   */
  private closeChannel(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.close();
      this.channels.delete(channelName);
    }
  }

  /**
   * 清理所有资源
   */
  public destroy() {
    this.channels.forEach((channel) => {
      channel.close();
    });
    this.channels.clear();
    this.subscriptions.clear();
  }
}

// 全局共享数据管理器实例
const shareableManager = new ShareableDataManager();

/**
 * 将对象的属性包装成「共享属性」
 * 共享属性会自动订阅属性的变化，同时在自身变化的时候会发送一个广播通知其他订阅者进行更新
 *
 * @param target - 目标对象
 * @param propertyKey - 属性名
 * @param options - 配置选项
 * @returns 清理函数
 */
export function makeDataShareable<T extends object>(
  target: T,
  propertyKey: keyof T,
  options: IShareableOptions,
): () => void {
  const { channelName, identifierType } = options;
  if (!identifierType) {
    return () => {};
  }

  // 标记当前实例正在更新，避免循环广播
  let isUpdating = false;

  // 订阅来自其他窗口的数据更新
  const unsubscribeExternal = shareableManager.subscribe(
    channelName,
    (newData) => {
      if (isUpdating) return; // 避免循环更新

      if (newData !== null) {
        // 使用深度比较来检查数据是否真正发生变化
        try {
          const newSerialized = JSON.stringify(newData);
          const currentSerialized = JSON.stringify(target[propertyKey]);
          if (newSerialized !== currentSerialized) {
            isUpdating = true;
            target[propertyKey] = newData;
            isUpdating = false;
          }
        } catch (error) {
          // 如果序列化失败，回退到引用比较
          console.warn(
            '[makeDataShareable] Failed to compare data, falling back to reference comparison:',
            error,
          );
          if (newData !== target[propertyKey]) {
            isUpdating = true;
            target[propertyKey] = newData;
            isUpdating = false;
          }
        }
      }
    },
    identifierType,
  );

  // 监听本地属性变化并广播
  const disposeReaction = reaction(
    () => target[propertyKey],
    (newValue, previousValue) => {
      if (isUpdating) return; // 避免循环广播

      // 使用深度比较来检查数据是否真正发生变化
      try {
        const newSerialized = JSON.stringify(newValue);
        const prevSerialized = JSON.stringify(previousValue);

        if (newSerialized !== prevSerialized) {
          shareableManager.broadcastUpdate(channelName, newValue);
        }
      } catch (error) {
        // 如果序列化失败，回退到引用比较
        console.warn(
          '[makeDataShareable] Failed to compare values, falling back to reference comparison:',
          error,
        );
        if (newValue !== previousValue) {
          shareableManager.broadcastUpdate(channelName, newValue);
        }
      }
    },
  );

  // 返回清理函数
  return () => {
    unsubscribeExternal();
    disposeReaction();
  };
}

/**
 * 清理所有共享数据的工具函数
 */
export function cleanupAllShareableData() {
  shareableManager.destroy();
}

export { IShareableOptions, EShareableIdentifierType };
export default shareableManager;
