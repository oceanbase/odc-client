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

interface IShareableOptions {
  /**
   * 共享数据的唯一标识符
   */
  channelName: string;
}

/**
 * 共享数据管理器
 * 使用 BroadcastChannel 实现跨窗口的数据同步
 */
class ShareableDataManager {
  private channels = new Map<string, BroadcastChannel>();
  private subscriptions = new Map<string, Set<(data: any) => void>>();

  /**
   * 获取或创建BroadcastChannel
   */
  private getChannel(channelName: string): BroadcastChannel | null {
    try {
      if (!this.channels.has(channelName)) {
        // 检查 BroadcastChannel 是否可用
        if (typeof BroadcastChannel === 'undefined') {
          console.warn('[makeDataShareable] BroadcastChannel is not available in this environment');
          return null;
        }

        const channel = new BroadcastChannel(channelName);
        this.channels.set(channelName, channel);

        // 监听来自其他窗口/标签页的消息
        channel.addEventListener('message', (event) => {
          try {
            const { type, data, userId } = event.data;
            if (type === 'data_update') {
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
            }
          } catch (error) {
            console.error('[makeDataShareable] Error processing message:', error);
          }
        });

        // 监听错误事件
        channel.addEventListener('messageerror', (event) => {
          console.error('[makeDataShareable] Message error:', event);
        });
      }
      return this.channels.get(channelName)!;
    } catch (error) {
      console.error('[makeDataShareable] Failed to create/get channel:', error);
      return null;
    }
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
   * 广播数据更新
   */
  public broadcastUpdate(channelName: string, data: any) {
    try {
      const channel = this.getChannel(channelName);

      // 如果 channel 不可用，直接返回
      if (!channel) {
        return;
      }

      const safeData = this.safeSerialize(data);

      if (safeData !== null) {
        channel.postMessage({
          type: 'data_update',
          data: safeData,
          userId: login.user?.id, // 添加用户ID
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('[makeDataShareable] Failed to broadcast update:', error);
    }
  }

  /**
   * 订阅数据变化
   */
  public subscribe(channelName: string, callback: (data: any) => void): () => void {
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
      try {
        channel.close();
      } catch (error) {
        console.error('[makeDataShareable] Error closing channel:', error);
      }
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
  const { channelName } = options;

  // 标记当前实例正在更新，避免循环广播
  let isUpdating = false;

  // 订阅来自其他窗口的数据更新
  const unsubscribeExternal = shareableManager.subscribe(channelName, (newData) => {
    if (isUpdating) return; // 避免循环更新

    if (newData !== null) {
      // 深度比较数据是否真正发生变化
      try {
        const newSerialized = JSON.stringify(newData);
        const currentSerialized = JSON.stringify(target[propertyKey]);

        if (newSerialized !== currentSerialized) {
          isUpdating = true;
          target[propertyKey] = newData;
          isUpdating = false;
        }
      } catch (error) {
        // 如果序列化失败，直接比较引用
        if (newData !== target[propertyKey]) {
          isUpdating = true;
          target[propertyKey] = newData;
          isUpdating = false;
        }
      }
    }
  });

  // 监听本地属性变化并广播
  const disposeReaction = reaction(
    () => target[propertyKey],
    (newValue, previousValue) => {
      if (isUpdating) return; // 避免循环广播

      // 只有在值真正发生变化时才广播
      try {
        const newSerialized = JSON.stringify(newValue);
        const prevSerialized = JSON.stringify(previousValue);

        if (newSerialized !== prevSerialized) {
          shareableManager.broadcastUpdate(channelName, newValue);
        }
      } catch (error) {
        // 如果序列化失败，直接比较引用
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

export { IShareableOptions };
export default shareableManager;
