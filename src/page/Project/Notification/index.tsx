import { formatMessage } from '@/util/intl';
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

import { useState } from 'react';
import SCLayout, { MenuItem } from '../components/SCLayout';
import Message from './components/Message';
import Policy from './components/Policy';
import Channel from './components/Channel';

enum ENotificationPage {
  MESSAGE = 'message',
  POLICY = 'policy',
  CHANNEL = 'channel',
}
const contentMap = {
  [ENotificationPage.MESSAGE]: {
    component: Message,
  },
  [ENotificationPage.POLICY]: {
    component: Policy,
  },
  [ENotificationPage.CHANNEL]: {
    component: Channel,
  },
};
const Notification: React.FC<{
  id: number;
}> = ({ id }) => {
  const items: MenuItem[] = [
    {
      label: formatMessage({ id: 'src.page.Project.Notification.3538B93C' }), //'推送记录'
      key: 'message',
    },
    {
      label: formatMessage({ id: 'src.page.Project.Notification.25A341FB' }), //'推送规则'
      key: 'policy',
    },
    {
      label: formatMessage({ id: 'src.page.Project.Notification.87BBE655' }), //'推送通道'
      key: 'channel',
    },
  ];

  const [key, setKey] = useState<string>(items?.[0]?.key as string);
  const Component = contentMap?.[key]?.component;
  const handleItemOnClick = (key: string) => {
    setKey(key);
  };
  return (
    <SCLayout
      sider={{
        loading: false,
        items,
        selectedKey: [key],
        handleItemOnClick,
      }}
      content={<Component key={key} projectId={id} />}
    />
  );
};
export default Notification;
