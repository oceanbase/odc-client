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

export default function (value: string | null) {
  if (value === null) {
    return 'NULL';
  } else if (typeof value === 'undefined') {
    return 'DEFAULT';
  }
  return `to_timestamp('${value}', 'YYYY-MM-DD HH24:MI:SS.FF')`;
}

export function convertTimestamp(timestamp: number) {
  if (!timestamp) return 'NULL';
  const date = new Date(timestamp);
  let hours = date.getHours();
  const amPm = hours < 12 ? 'AM' : 'PM';
  hours = hours % 12 || 12; // More concise way to convert 0 to 12
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  // Formatting the date and time using template literals
  const formattedDate = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(
    -2,
  )}-${date.getFullYear()} ${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}:${(
    '0' + seconds
  ).slice(-2)}.${('00' + milliseconds).slice(-3)} ${amPm}`;
  return `to_timestamp('${formattedDate}', 'DD-MM-YYYY HH:MI:SS.FF3 ${amPm}')`;
}
