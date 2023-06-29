import { detailRiskLevel } from '@/common/network/riskLevel';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { transformSecond } from '@/util/utils';
import { Descriptions, Drawer, Timeline } from 'antd';
import { useEffect, useState } from 'react';
import RiskLevelLabel from '../components/RiskLevelLabel';
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

  if (!drawerVisible) {
    return null;
  }
  return (
    <Drawer
      width={520}
      open={drawerVisible}
      destroyOnClose={true}
      onClose={handleDrawerClose}
      title={'查看风险等级'}
      className={styles.riskLevelDrawer}
    >
      <Descriptions column={1}>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'风险等级'}>
          <RiskLevelLabel level={record?.level} color={record?.style} />
        </Descriptions.Item>
        <div>审批流程</div>
        <div className={styles.approvalContainer} style={{ marginBottom: '8px' }}>
          <Timeline className={styles.approvalDescriptios}>
            {record?.approvalFlowConfig?.nodes?.map(
              (
                { externalApprovalName = '', autoApproval = false, resourceRoleName = '' },
                index,
              ) => {
                return (
                  <Timeline.Item key={index}>
                    <Descriptions title={externalApprovalName} column={1}>
                      <div className={styles.nodeBold}>审批角色 {index + 1}</div>
                      <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'审批角色'}>
                        <div className={styles.nodeContent}>
                          {autoApproval ? '自动审批' : resourceRoleName}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Timeline.Item>
                );
              },
            )}
          </Timeline>
        </div>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'审批有效期'}>
          <div className={styles.nodeContent}>
            {transformSecond(record?.approvalFlowConfig?.approvalExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'执行等待有效期'}>
          <div className={styles.nodeContent}>
            {transformSecond(record?.approvalFlowConfig?.waitExecutionExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'执行有效期'}>
          <div className={styles.nodeContent}>
            {transformSecond(record?.approvalFlowConfig?.executionExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'备注'}>
          <div className={styles.nodeContent}>{record?.description}</div>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};
export default ViewRiskLevelDrawer;
