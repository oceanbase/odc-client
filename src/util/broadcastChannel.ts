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

import logger from './logger';
/** @description 收集全局使用的频道，统一管理 */
export enum ChannelMap {
  LDAP_TEST = 'LDAP_TEST',
  LDAP_MAIN = 'LDAP_MAIN',
  ODC_SSO_TEST = 'ODC_SSO_TEST',
}
class Channel {
  private channelMap: Map<ChannelMap, BroadcastChannel> = new Map<ChannelMap, BroadcastChannel>();
  /**
   * 重置消息通道
   */
  reset() {
    if (this.channelMap.size) {
      this.destory();
    }
  }
  /**
   * 根据通道名称添加通道
   * @param channelName
   */
  addSingle(channelName: ChannelMap) {
    if (!this.isExists(channelName)) {
      this.channelMap.set(channelName, new BroadcastChannel(channelName));
      logger.log(`[Channel] ${channelName} is active.`);
      return this;
    }
    logger.log(`[Channel] ${channelName} has existsed.`);
    return this;
  }
  /**
   * 根据通道名称添加通道
   * @param channelName: `ChannelMap | ChannelMap[]`
   * @returns channel 当前channelMap实例
   */
  add(channelName: ChannelMap | ChannelMap[]) {
    if (Array.isArray(channelName)) {
      channelName.forEach((_channelName) => this.addSingle(_channelName));
      return this;
    }
    return this.addSingle(channelName);
  }
  /**
   * 向某个通道发送数据
   * @param channelName 发送数据的目的通道名称
   * @param data
   * @returns
   */
  send(channelName: ChannelMap, data: any) {
    if (this.isExists(channelName)) {
      this.channelMap.get(channelName)?.postMessage(data);
      return true;
    } else {
      logger.log(
        `[Channel] ${channelName} is not existsed, if you want to send message to this channel, please add this channel firstly.`,
      );
      return false;
    }
  }
  /**
   * 判断通道是否已存在
   * @param channelName
   */
  isExists(channelName: ChannelMap) {
    return this.channelMap?.has(channelName);
  }
  /**
   * 监听通道，并执行回调函数
   * @param channelName 要监听的通道名称
   * @param callback 要监听的通道事件触发时执行的回调函数
   * @param callbackedClose 执行回调后是否关闭当前频道, 默认为false，简单的单方面传递消息的情况下可以设置为true。
   */
  listen(
    channelName: ChannelMap,
    callback: (data?: any) => void,
    callbackedClose: boolean = false,
  ) {
    if (this.isExists(channelName)) {
      this.channelMap.get(channelName).addEventListener('message', ({ data }) => {
        callback?.(data);
        callbackedClose && this.close(channelName);
      });
    }
  }
  /**
   * 关闭通道
   * @param channelName 要关闭的通道的名称
   */
  close(channelName: ChannelMap | ChannelMap[]) {
    if (Array.isArray(channelName)) {
      channelName.forEach((item) => {
        logger.log(`[Channel] try to close ${channelName}`);
        this.channelMap.get(item)?.close();
        this.channelMap.delete(item);
        logger.log(`[Channel] channel ${channelName?.join(', ')} is closed successfully`);
      });
      return;
    }
    logger.log(`[Channel] try to close ${channelName}`);
    this.channelMap.get(channelName)?.close();
    this.channelMap.delete(channelName);
    logger.log(`[Channel] channel ${channelName} is closed successfully`);
  }
  destory() {
    this.channelMap.forEach((channel) => {
      channel?.close();
    });
    this.channelMap.clear();
    logger.log('[Channel] all channel is destoryed');
  }
}
const channel = new Channel();
export default channel;
