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

import { useEffect, useRef } from 'react';
import { generateUniqKey } from '../utils';

type ILoopWrapFunc<T> = (count: number) => T;

type IUserFunc = (...args) => void;
/**
 * 返回一个包装后的执行函数，调用一次之后，每隔 interval 毫秒会再次执行。
 * 假如再次调用，会用新的参数进行循环执行。
 */
export function useLoop<T extends IUserFunc>(
  func: ILoopWrapFunc<T>,
  interval,
): {
  loop: T;
  destory: () => void;
} {
  /**
   * 函数当前 token，只有 token 相同才可以继续循环
   */
  const tokenRef = useRef<string>();
  /**
   * 当前循环的次数
   */
  const countRef = useRef<number>(0);
  /**
   * 当前定时器的id
   */
  const clockRef = useRef<number>();
  useEffect(() => {
    return () => {
      tokenRef.current = null;
      clockRef.current && clearTimeout(clockRef.current);
    };
  }, []);
  return {
    loop: ((...args) => {
      clockRef.current && clearTimeout(clockRef.current);
      tokenRef.current = generateUniqKey();
      countRef.current = 0;
      async function run(token) {
        if (token != tokenRef.current) {
          return;
        }
        const runFunc = func(countRef.current);
        countRef.current = countRef.current + 1;
        await runFunc(...args);
        if (token == tokenRef.current) {
          clockRef.current = window.setTimeout(() => {
            run(token);
          }, interval);
        }
      }
      run(tokenRef.current);
    }) as T,
    destory: () => {
      tokenRef.current = null;
      clockRef.current && clearTimeout(clockRef.current);
    },
  };
}
