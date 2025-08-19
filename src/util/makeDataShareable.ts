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
  private getChannel(channelName: string): BroadcastChannel {
    if (!this.channels.has(channelName)) {
      const channel = new BroadcastChannel(channelName);
      this.channels.set(channelName, channel);

      // 监听来自其他窗口/标签页的消息
      channel.addEventListener('message', (event) => {
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
    channel.postMessage({
      type: 'data_update',
      data,
      userId: login.user?.id, // 添加用户ID
      timestamp: Date.now(),
    });
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
  const { channelName } = options;

  // 标记当前实例正在更新，避免循环广播
  let isUpdating = false;

  // 订阅来自其他窗口的数据更新
  const unsubscribeExternal = shareableManager.subscribe(channelName, (newData) => {
    if (isUpdating) return; // 避免循环更新

    if (newData !== null && newData !== target[propertyKey]) {
      isUpdating = true;
      target[propertyKey] = newData;
      isUpdating = false;
    }
  });

  // 监听本地属性变化并广播
  const disposeReaction = reaction(
    () => target[propertyKey],
    (newValue) => {
      if (isUpdating) return; // 避免循环广播

      shareableManager.broadcastUpdate(channelName, newValue);
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
