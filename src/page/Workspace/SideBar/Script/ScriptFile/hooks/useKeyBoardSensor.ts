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

import { useEffect, useState, useContext } from 'react';
import ActivityBarContext from '@/page/Workspace/context/ActivityBarContext';
import { ActivityBarItemType } from '@/page/Workspace/ActivityBar/type';

const useKeyBoardSensor = () => {
  const activityContext = useContext(ActivityBarContext);
  const [crtlorCommandPressed, setCrtlorCommandPressed] = useState<boolean>(false);
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setCrtlorCommandPressed(true);
    }
    if (event.shiftKey) {
      setShiftPressed(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) {
      setCrtlorCommandPressed(false);
    }
    if (!event.shiftKey) {
      setShiftPressed(false);
    }
  };

  useEffect(() => {
    if (activityContext.activeKey === ActivityBarItemType.Script) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activityContext.activeKey]);

  return {
    crtlorCommandPressed,
    shiftPressed,
  };
};

export default useKeyBoardSensor;
