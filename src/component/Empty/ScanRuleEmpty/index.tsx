import { Acess, createPermission } from '@/component/Acess';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Empty } from 'antd';
import styles from './index.less';

export default function ScanRuleEmpty({ showActionButton }) {
  return (
    <Acess
      fallback={
        <Empty
          description={
            formatMessage({ id: 'odc.src.page.Secure.RiskLevel.components.NoRule' }) /* 暂无规则 */
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            flexGrow: 1,
          }}
        />
      }
      {...createPermission(IManagerResourceType.project, actionTypes.create)}
    >
      <div className={styles.scanRuleEmptyWrapper}>
        <Empty
          description={
            <div>
              <div>风险识别规则是通过表达式配置的规则，会决定工单的审批流程。</div>
              <div>
                如：「环境 等于 生产」将会匹配在「生产」环境中执行的工单，并执行对应的审批流程
              </div>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {showActionButton()}
        </Empty>
      </div>
    </Acess>
  );
}
