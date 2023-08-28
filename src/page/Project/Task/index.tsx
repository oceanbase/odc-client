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

import TaskManage from '@/component/Task';
import tracert from '@/util/tracert';
import React, { useEffect } from 'react';
interface IProps {
  id: string;
}
const Task: React.FC<IProps> = (props) => {
  useEffect(() => {
    tracert.expo('a3112.b64002.c330859');
  }, []);
  return <TaskManage projectId={Number(props.id)} />;
};

export default Task;
