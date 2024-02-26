import { IResponseData } from '@/d.ts';
import {
  IChannel,
  ITestChannelResult,
  IPolicy,
  IMessage,
  TBatchUpdatePolicy,
  EMessageStatus,
  EChannelType,
} from '@/d.ts/projectNotification';
import request from '@/util/request';

// #region ------------------------- notification channel -------------------------
/**
 * 1. 根据项目ID获取消息通道列表
 * @param projectId 项目ID
 * @returns `data: IChannel[]` 消息通道列表
 */
export async function getChannelsList(
  projectId: number,
  params?: Partial<{
    title?: string;
    status?: EMessageStatus;
    sort?: string;
    page?: number;
    size?: number;
  }>,
): Promise<IResponseData<Omit<IChannel<EChannelType>, 'channelConfig'>>> {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/notification/channels`,
    {
      params,
    },
  );
  return res?.data;
}
/**
 * 2. 根据通道ID获取通道详情
 * @param projectId 项目ID
 * @param channelId 通道ID
 * @return `data: IChannel` 通道详情
 */
export async function detailChannel(
  projectId: number,
  channelId: number,
): Promise<IChannel<EChannelType>> {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/notification/channels/${channelId}`,
  );
  return res?.data;
}

/**
 * 3. 测试消息通道配置是否可用
 * @param projectId
 * @param data
 * @returns `result: ITestChannelResult` 通道配置测试结果
 */
export async function testChannel(
  projectId: number,
  data: Pick<IChannel<EChannelType>, 'type' | 'channelConfig'>,
): Promise<ITestChannelResult> {
  const res = await request.post(
    `/api/v2/collaboration/projects/${projectId}/notification/channels/test`,
    {
      data,
    },
  );
  return res?.data;
}

/**
 * 4. 创建通道
 * @param projectId 项目ID
 * @param data 通道
 * @returns `result: IChannel` 通道
 */
export async function createChannel(
  projectId: number,
  data: IChannel<EChannelType>,
): Promise<IChannel<EChannelType>> {
  const res = await request.post(
    `/api/v2/collaboration/projects/${projectId}/notification/channels`,
    {
      data,
    },
  );
  return res?.data;
}

/**
 * 5. 编辑通道
 * @param projectId 项目ID
 * @param channelId 通道ID
 * @param data 通道属性
 * @returns `result: IChannel` 编辑成功后的通道
 */
export async function editChannel(
  projectId: number,
  channelId: number,
  data: IChannel<EChannelType>,
): Promise<IChannel<EChannelType>> {
  const res = await request.put(
    `/api/v2/collaboration/projects/${projectId}/notification/channels/${channelId}`,
    {
      data,
    },
  );
  return res?.data;
}

/**
 * 6. 删除通道
 * @param projectId 项目ID
 * @param channelId 通道ID
 * @returns `result: IChannel` 被删除的通道
 */
export async function deleteChannel(
  projectId: number,
  channelId: number,
): Promise<IChannel<EChannelType>> {
  const res = await request.delete(
    `/api/v2/collaboration/projects/${projectId}/notification/channels/${channelId}`,
  );
  return res?.data;
}
/**
 * 7. 判断通道名称是否已经存在
 * @param projectId 项目ID
 * @param channelName 通道名称
 * @returns `result: boolean` 通道名称是否已经存在
 */
export async function existsChannel(
  projectId: number,
  channelName: string,
): Promise<{
  result: boolean;
}> {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/notification/channels/exists?name=${channelName}`,
  );
  return res?.data;
}
// #endregion

// #region ------------------------- notification policy -------------------------
/**
 * 返回消息规则列表数据
 * @param projectId 项目ID
 * @returns
 */
export async function getPoliciesList(
  projectId: number,
  params?: Partial<{
    fuzzyTableColumn: string;
    datasource: number[];
    database: number[];
    table: string[];
    column: string[];
    maskingAlgorithm: number[];
    enabled: boolean[];
  }>,
): Promise<IResponseData<IPolicy>> {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/notification/policies`,
    {
      params,
    },
  );
  return res?.data;
}
/**
 * 查看消息规则详情
 * @param projectId
 * @param policyId
 * @returns
 */
export async function detailPolicy(projectId: number, policyId: number): Promise<IPolicy> {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/notification/policies/${policyId}`,
  );
  return res?.data;
}
/**
 * 批量编辑消息规则
 * @param projectId
 * @param policies
 * @returns
 */
export async function batchUpdatePolicy(
  projectId: number,
  policies: TBatchUpdatePolicy[],
): Promise<IResponseData<IPolicy>> {
  const res = await request.put(
    `/api/v2/collaboration/projects/${projectId}/notification/policies`,
    {
      data: policies,
    },
  );
  return res?.data;
}
// #endregion

// #region ------------------------- notification messages -------------------------
/**
 * 根据项目ID获取推送记录列表
 * @param projectId
 * @returns
 */
export async function getMessagesList(
  projectId: number,
  params: Partial<{
    title?: string;
    status?: EMessageStatus;
    sort?: string;
    page?: number;
    size?: number;
  }>,
): Promise<IResponseData<IMessage>> {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/notification/messages`,
    {
      params,
    },
  );
  return res?.data;
}
export async function detailMessage(projectId: number, messageId: number): Promise<IMessage> {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/notification/messages/${messageId}`,
  );
  return res?.data;
}
// #endregion
