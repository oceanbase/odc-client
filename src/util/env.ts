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

export function isClient(): boolean {
  return ENV_target === 'client';
}

export function isMac(): boolean {
  return /macintosh|mac os x/i.test(navigator.userAgent);
}

/**
 * 是否接入了OCP
 */
export function haveOCP(): boolean {
  return window.haveOCP || !!HAVEOCP;
}

/**
 * 是否获得了用户信息采集许可
 * @returns boolean
 * @return true，已经获得用户信息采集许可。
 * @return false，未获得用户信息采集许可。
 */
export function hasEventTrackingPermission(): boolean {
  const eventTrackingPermission: boolean =
    localStorage.getItem('eventTrackingPermission') === 'true';
  if (eventTrackingPermission) {
    return true;
  }
  return false;
}

/**
 * 是否已经弹出过信息采集许可
 * @returns boolean
 * @return true，已经弹出过信息采集许可。
 * @return false，未弹出过信息采集许可。
 */
export function checkHasAskPermission(): boolean {
  const eventTracking: string = localStorage.getItem('eventTrackingPermission');
  if (eventTracking !== null) {
    //eventTracking的值可能为null、'true'、 'false'。 eventTracking不为null，说明已经弹出过信息采集许可弹窗了。
    return true;
  }
  return false;
}
