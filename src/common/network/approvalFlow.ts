import { ApprovalFlowConfig } from '@/d.ts/approvalFlow';
import request from '@/util/request';
// ApprovalFlowController
export async function createApprovalFlow(data: ApprovalFlowConfig): Promise<boolean> {
  const ret = await request.post(`/api/v2/regulation/approvalFlows`, {
    data,
  });
  return ret?.successful;
}

export async function updateApprovalFlow(
  approvalFlowID: number,
  data: ApprovalFlowConfig,
): Promise<boolean> {
  const ret = await request.put(`/api/v2/regulation/approvalFlows/${approvalFlowID}`, {
    data,
  });
  return ret?.successful;
}

export async function listApprovalFlows(): Promise<ApprovalFlowConfig[]> {
  const ret = await request.get(`/api/v2/regulation/approvalFlows`);
  return ret?.data?.contents;
}

export async function detailApprovalFlow(approvalFlowID: number): Promise<ApprovalFlowConfig> {
  const ret = await request.get(`/api/v2/regulation/approvalFlows/${approvalFlowID}`);
  return ret?.data?.contents;
}

export async function deleteApprovalFlow(approvalFlowID: number): Promise<boolean> {
  const ret = await request.delete(`/api/v2/regulation/approvalFlows/${approvalFlowID}`);
  return ret?.successful;
}
