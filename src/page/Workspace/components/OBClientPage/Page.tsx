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

import { OBClientPage as OBClientPageModel } from '@/store/helper/page/pages';
import { SettingStore } from '@/store/setting';
import { inject, observer } from 'mobx-react';
import OBClient from '.';

interface IProps {
  params: OBClientPageModel['pageParams'];
  settingStore?: SettingStore;
}

export default inject('settingStore')(
  observer(function OBClientPage({ params, settingStore }: IProps) {
    return (
      <OBClient
        theme={settingStore.theme?.cmdTheme}
        databaseId={params?.databaseId}
        datasourceId={params?.dataSourceId}
      />
    );
  }),
);
