import { useEffect, useRef } from 'react';
import { generateUniqKey } from '../utils';

type ILoopWrapFunc<T> = (count: number) => T;

type IUserFunc = (...args) => void;
/**
 * 返回一个包装后的执行函数，调用一次之后，每隔 interval 毫秒会再次执行。
 * 假如再次调用，会用新的参数进行循环执行。
 */
export function useLoop<T extends IUserFunc>(func: ILoopWrapFunc<T>, interval): T {
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
  return ((...args) => {
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
  }) as T;
}
