export function isClient(): boolean {
  return ENV_target === 'client';
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
