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

import PageLoading from '@/component/PageLoading';
import { Outlet } from '@umijs/max';
import React, { useEffect, useRef, useState } from 'react';

interface IProps {}

interface IPageTask {
  tip: string;
  showError: boolean;
  queue?: { waitNumber: number };
}

export const PageLoadingContext = React.createContext<{
  setTask?: (task: IPageTask) => void;
  removeTask?: () => void;
}>({});

const PageLoadingWrapper: React.FC<IProps> = function ({ children }) {
  const [task, setTask] = useState<IPageTask>(null);
  const [showTask, setShowTask] = useState(true);
  const clearTimer = useRef(null);
  useEffect(() => {
    if (task) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
      setShowTask(true);
    } else if (showTask && !task) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
      clearTimer.current = setTimeout(() => {
        setShowTask(false);
      }, 500);
    }
  }, [task, showTask]);
  return (
    <PageLoadingContext.Provider
      value={{
        setTask(task) {
          setTask(task);
        },
        removeTask() {
          setTask(null);
        },
      }}
    >
      <Outlet />
      {showTask && <PageLoading showError={task?.showError} tip={task?.tip} queue={task?.queue} />}
    </PageLoadingContext.Provider>
  );
};

export default PageLoadingWrapper;
