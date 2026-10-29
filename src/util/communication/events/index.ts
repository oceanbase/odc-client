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
