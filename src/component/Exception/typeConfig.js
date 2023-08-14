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

import { formatMessage } from '@/util/intl';

const config = {
  403: {
    img: '/img/403.svg',
    title: '403',
    desc: formatMessage({
      id: 'odc.component.Exception.typeConfig.SorryYouAreNotAuthorized',
    }),
  },

  404: {
    img: '/img/404.svg',
    title: '404',
    desc: formatMessage({
      id: 'odc.component.Exception.typeConfig.SorryThePageYouVisited',
    }),
  },

  500: {
    img: '/img/500.svg',
    title: '500',
    desc: formatMessage({
      id: 'odc.component.Exception.typeConfig.SorryTheServerHasAn',
    }),
  },
};

export default config;
