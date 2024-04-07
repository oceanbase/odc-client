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

import { haveOCP } from './env';
import * as Sentry from '@sentry/react';
export function getSentry() {
  if (haveOCP()) {
    return Sentry;
  }
}

export function initSentry() {
  getSentry()?.init({
    dsn: 'https://98fb52ab508043bf94a763dc51d5a2e0@obc-sentry.oceanbase.com/6',
    debug: false,
    release: ODC_VERSION,
    transport: Sentry.makeXHRTransport,
  });
}
