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

import { detailRiskLevel } from '@/common/network/riskLevel';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { formatMessage } from '@/util/intl';
import { transformSecond } from '@/util/utils';
import { Descriptions, Drawer, Timeline } from 'antd';
import { useEffect, useState } from 'react';
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
                                  id:
                                    'odc.RiskLevel.components.ViewRiskLevelDrawer.AutomaticApproval',
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
