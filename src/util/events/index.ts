import { PackageBodyPage, PLEditPage, PLPageType } from '@/store/helper/page/pages/pl';
import EventBus from 'eventbusjs';
import { IPLPageActionData, IPLPageCreatedEventData, ODCEventType } from './type';

export function triggerActionAfterPLPageCreated(
  plPage: PLEditPage | PackageBodyPage,
  action: 'compile' | 'debug' | 'run',
  isNew: boolean,
) {
  if (!isNew) {
    EventBus.dispatch(ODCEventType.PLPageAction, null, {
      action: action,
      databaseId: plPage?.databaseId,
      plName:
        plPage?.pageParams?.plPageType === PLPageType.pkgBody
          ? plPage?.pageParams?.plSchema?.plName
          : plPage?.pageParams?.plName,
      plType: plPage?.plType,
    } as IPLPageActionData);
    return;
  }

  function onPageCreated(e, data: IPLPageCreatedEventData) {
    if (data?.pageKey !== plPage?.pageKey) {
      return;
    }
    EventBus.removeEventListener(ODCEventType.PLPageCreated, onPageCreated);
    EventBus.dispatch(ODCEventType.PLPageAction, null, {
      action: action,
      databaseId: plPage?.databaseId,
      plName:
        plPage?.pageParams?.plPageType === PLPageType.pkgBody
          ? plPage?.pageParams?.plSchema?.plName
          : plPage?.pageParams?.plName,
      plType: plPage?.plType,
    } as IPLPageActionData);
  }
  EventBus.addEventListener(ODCEventType.PLPageCreated, onPageCreated);
  /**
   * 超时删除
   */
  setTimeout(() => {
    EventBus.removeEventListener(ODCEventType.PLPageCreated, onPageCreated);
  }, 5000);
}
