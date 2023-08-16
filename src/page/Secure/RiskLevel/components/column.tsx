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

import { Acess, createPermission } from '@/component/Acess';
import Action from '@/component/Action';
import TooltipContent from '@/component/TooltipContent';
import { actionTypes, IManagerResourceType, ITaskFlowNode } from '@/d.ts';
import { transformOBConfigTimeStringToText, transformSecond } from '@/util/utils';
import { formatMessage } from '@umijs/max';
interface ApprovalProcessProps {
  nodes: ITaskFlowNode[];
}
const ApprovalProcess = ({ nodes }: ApprovalProcessProps) => {
  return nodes
    ?.map((node) => {
      let label = '';
      const externalApprovalName = node?.externalApprovalName;
      if (node.autoApproval) {
        label = formatMessage({
          id: 'odc.Secure.RiskLevel.AutomaticApproval',
        }); //自动审批
      } else if (externalApprovalName) {
        label = formatMessage(
          {
            id: 'odc.Secure.RiskLevel.ExternalApprovalExternalapprovalname',
          },
          {
            externalApprovalName: externalApprovalName,
          },
        ); //`外部审批(${externalApprovalName})`
      } else {
        label = node?.resourceRoleName || '-';
      }
      return label;
    })
    .join(' - ');
};
export function getColumns({ openFormModal, handleDelete }) {
  return [
    {
      title: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.ProcessName',
      }), //'流程名称'
      width: 120,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => <TooltipContent content={text} />,
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.ApprovalProcess',
      }), //'审批流程'
      width: 150,
      dataIndex: 'nodes',
      key: 'nodes',
      ellipsis: true,
      render: (text, record) => (
        <TooltipContent
          content={ApprovalProcess({
            nodes: record?.nodes,
          })}
        />
      ),
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.ValidApprovalPeriod',
      }), //'审批有效期'
      width: 80,
      dataIndex: 'approvalExpirationIntervalSeconds',
      key: 'approvalExpirationIntervalSeconds',
      ellipsis: true,
      render: (text) => transformOBConfigTimeStringToText(transformSecond(text)),
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.ExecutionWaitingValidityPeriod',
      }), //'执行等待有效期'
      width: 96,
      dataIndex: 'waitExecutionExpirationIntervalSeconds',
      key: 'waitExecutionExpirationIntervalSeconds',
      ellipsis: true,
      render: (text) => transformOBConfigTimeStringToText(transformSecond(text)),
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.PeriodicPeriod',
      }), //'执行有效期'
      width: 80,
      dataIndex: 'executionExpirationIntervalSeconds',
      key: 'executionExpirationIntervalSeconds',
      ellipsis: true,
      render: (text) => transformOBConfigTimeStringToText(transformSecond(text)),
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.UsageAmount',
      }), //'使用数量'
      width: 72,
      dataIndex: 'referencedCount',
      key: 'referencedCount',
      ellipsis: true,
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.Operate',
      }), //'操作'
      width: 90,
      key: 'action',
      // fixed: 'right',
      render: (_, record, index) => (
        <Action.Group>
          <Acess {...createPermission(IManagerResourceType.approval_flow, actionTypes.update)}>
            <Action.Link
              disabled={record.builtIn}
              onClick={async () => {
                openFormModal(record.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.Secure.Approval.Edit',
                }) /*编辑*/
              }
            </Action.Link>
          </Acess>
          <Acess {...createPermission(IManagerResourceType.approval_flow, actionTypes.delete)}>
            <Action.Link
              disabled={record.builtIn}
              onClick={async () => {
                handleDelete(record.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.Secure.Approval.Delete',
                }) /*删除*/
              }
            </Action.Link>
          </Acess>
        </Action.Group>
      ),
    },
  ];
}
