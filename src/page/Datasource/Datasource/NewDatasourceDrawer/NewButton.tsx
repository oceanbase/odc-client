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
import { Button } from 'antd';
import { useState } from 'react';
import NewDatasourceDrawer from '.';

export default function NewDatasourceButton(props: { onSuccess: () => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        {
          formatMessage({
            id: 'odc.Datasource.NewDatasourceDrawer.NewButton.CreateADataSource',
          }) /*新建数据源*/
        }
      </Button>
      <NewDatasourceDrawer
        visible={visible}
        close={() => setVisible(false)}
        onSuccess={props.onSuccess}
      />
    </>
  );
}
