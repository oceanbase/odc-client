/*
 * Copyright 2024 OceanBase
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

import PLTYPE from '@/constant/plType';
import { getRealNameInDatabase } from './sql';

export function getPLName(plType: any, entryName: string, packageName?: string) {
  switch (plType) {
    case PLTYPE.FUNCTION:
    case PLTYPE.PROCEDURE: {
      if (packageName) {
        return `${packageName}.${entryName}`;
      }
      return entryName;
    }
    case PLTYPE.PKG_BODY: {
      return `${entryName}.body`;
    }
    case PLTYPE.PKG_HEAD: {
      return `${entryName}.head`;
    }
    case PLTYPE.TRIGGER:
    case PLTYPE.TYPE:
      return entryName;
  }
  return null;
}

function removePkgBodyAndHead(plName, plType) {
  if (!plName || ![PLTYPE.PKG_BODY, PLTYPE.PKG_HEAD].includes(plType)) {
    return plName;
  }
  const arr = plName.split('.');
  if (['body', 'head'].includes(arr[arr.length - 1])) {
    arr.pop();
    return arr.join('.');
  }
  return plName;
}

export function getEntryNameFromPLName(plType: any, plName: string, fromPackage: boolean = false) {
  switch (plType) {
    case PLTYPE.FUNCTION:
    case PLTYPE.PROCEDURE:
    case PLTYPE.TRIGGER:
    case PLTYPE.TYPE:
    case PLTYPE.SYNONYM: {
      return getRealNameInDatabase(plName, true);
    }
    case PLTYPE.PKG_BODY:
    case PLTYPE.PKG_HEAD: {
      return getRealNameInDatabase(plName, true, true);
    }
  }
  return null;
}

export function checkPLNameChanged(
  plName: string,
  newPLName: string,
  plType: any,
  fromPackage: boolean = false,
  dbName: string,
) {
  let entryName = removePkgBodyAndHead(plName, plType);
  const newEntryName = getEntryNameFromPLName(plType, newPLName, fromPackage);
  let newEntryNameArr = newEntryName.split('.');
  if (newEntryNameArr.length === 1) {
    if (newEntryNameArr[0] === entryName) {
      return null;
    } else {
      return [entryName, newEntryNameArr[0]];
    }
  } else {
    if (newEntryNameArr.length > 1) {
      const newPLName = newEntryNameArr.slice(1).join('.');
      if (dbName?.toUpperCase() === newEntryNameArr[0] && entryName === newPLName) {
        return null;
      } else {
        return [dbName?.toUpperCase() + '.' + entryName, newEntryNameArr.join('.')];
      }
    }
  }
  return null;
}
