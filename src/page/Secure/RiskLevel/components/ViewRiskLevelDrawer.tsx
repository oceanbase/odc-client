import { detailRiskLevel } from '@/common/network/riskLevel';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { formatMessage } from '@/util/intl';
import { transformSecond } from '@/util/utils';
import { Descriptions, Drawer, Timeline } from 'antd';
import { useEffect, useState } from 'react';
import RiskLevelLabel from '../../components/RiskLevelLabel';
import styles from './index.less';

const ViewRiskLevelDrawer: React.FC<{
  drawerVisible: boolean;
  handleDrawerClose: () => void;
  selectedRecord;
}> = ({ drawerVisible, handleDrawerClose, selectedRecord = {} }) => {
  const [record, setRecord] = useState<IRiskLevel>();
  const getDetailRiskLevel = async (riskLevelId: number) => {
    const rawData = await detailRiskLevel(riskLevelId);
    setRecord(rawData);
  };
  useEffect(() => {
    if (drawerVisible) {
      selectedRecord && getDetailRiskLevel(selectedRecord?.id);
    }
  }, [drawerVisible, selectedRecord]);
  return (
    <Drawer
      width={520}
      open={drawerVisible}
      destroyOnClose={true}
      onClose={handleDrawerClose}
      title={
        formatMessage({ id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ViewRiskLevels' }) //查看风险等级
      }
      className={styles.riskLevelDrawer}
    >
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.RiskLevel' }) //风险等级
          }
        >
          <RiskLevelLabel level={record?.level} color={record?.style} />
        </Descriptions.Item>
        <div>
          {
            formatMessage({
              id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ApprovalProcess',
            }) /*审批流程*/
          }
        </div>
        <div className={styles.approvalContainer}>
          <Timeline className={styles.approvalDescriptions}>
            {record?.approvalFlowConfig?.nodes?.map(
              (
                { externalApprovalName = '', autoApproval = false, resourceRoleName = '' },
                index,
              ) => {
                return (
                  <Timeline.Item key={index}>
                    {externalApprovalName ? (
                      <Descriptions
                        title={formatMessage({
                          id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ExternalApproval',
                        })}
                        /*外部审批*/ column={1}
                      >
                        <div className={styles.nodeBold}>{externalApprovalName}</div>
                      </Descriptions>
                    ) : (
                      <Descriptions column={1}>
                        <div className={styles.nodeBold}>
                          {
                            formatMessage({
                              id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ApprovalRole',
                            }) /*审批角色*/
                          }
                          {index + 1}
                        </div>
                        <Descriptions.Item
                          contentStyle={{ whiteSpace: 'pre' }}
                          label={
                            formatMessage({
                              id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ApprovalRole',
                            }) //审批角色
                          }
                        >
                          <div className={styles.nodeContent}>
                            {autoApproval
                              ? formatMessage({
                                  id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.AutomaticApproval',
                                }) //自动审批
                              : resourceRoleName}
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    )}
                  </Timeline.Item>
                );
              },
            )}
          </Timeline>
        </div>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({
              id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ValidityPeriodOfApproval',
            }) //审批有效期
          }
        >
          <div className={styles.nodeContent}>
            {transformSecond(record?.approvalFlowConfig?.approvalExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({
              id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ExecutionWaitingPeriod',
            }) //执行等待有效期
          }
        >
          <div className={styles.nodeContent}>
            {transformSecond(record?.approvalFlowConfig?.waitExecutionExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({
              id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.ExecutionValidityPeriod',
            }) //执行有效期
          }
        >
          <div className={styles.nodeContent}>
            {transformSecond(record?.approvalFlowConfig?.executionExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.RiskLevel.components.ViewRiskLevelDrawer.Description' }) //描述
          }
        >
          <div className={styles.nodeContent}>{record?.description}</div>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};
export default ViewRiskLevelDrawer;
