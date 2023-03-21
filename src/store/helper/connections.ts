import { IConnection, IConnectionStatus } from '@/d.ts';
import { ConnectionPlan } from '../connection';

/**
 * 生成获取connection 状态的计划
 */
export function makeConnectionStatusFetchPlans(
  connections: IConnection[],
  force?: boolean,
): ConnectionPlan[] {
  connections = connections.filter(
    (c) => !force && c.status.status === IConnectionStatus.TESTING && c.passwordSaved,
  );
  const plans: ConnectionPlan[] = [];
  /**
   * 前三个都单独发请求
   */
  for (let i = 0; i < 3 && i < connections.length; i++) {
    plans.push({
      key: Math.random(),
      data: [connections[i]],
    });
  }
  /**
   * 3-6，6-9都为一批
   */
  if (connections.length > 3) {
    const plan2 = connections.slice(3, 6);
    const plan3 = connections.slice(6, 9);
    plan2.length &&
      plans.push({
        key: Math.random(),
        data: plan2,
      });
    plan3.length &&
      plans.push({
        key: Math.random(),
        data: plan3,
      });
  }
  if (connections.length > 9) {
    /**
     * 后续的全部9个一组
     */
    for (let i = 9; i < connections.length; i = i + 9) {
      const p = connections.slice(i, i + 9);
      p.length &&
        plans.push({
          key: Math.random(),
          data: p,
        });
    }
  }
  return plans;
}
