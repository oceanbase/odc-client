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

import { IResponse, IResponseData } from '@/d.ts';
import request from '@/util/request';

export type Template = {
  id?: number;
  enabled?: boolean;
  name: string;
  projectId: number;
  orders: number[][];
  databaseSequenceList?: any[];
};
export type MultipleDatabase = {
  id: number;
  name: string;
  userId: number;
  multipleDatabases: {
    order: number;
    databaseId: number;
    databaseName: string;
  }[];
};
export async function createTemplate(
  template: Template,
  currentOrganizationId: string,
): Promise<boolean> {
  const response: IResponse<boolean> = await request.post(
    '/api/v2/databasechange/changingorder/templates',
    {
      data: template,
      params: {
        currentOrganizationId,
      },
    },
  );
  return response?.successful;
}
export async function existsTemplateName(
  templateName: string,
  projectId: any,
  currentOrganizationId: string,
): Promise<boolean> {
  const response: IResponse<{
    errorMessage: string;
    exists: boolean;
  }> = await request.get(`api/v2/databasechange/changingorder/templates/exists`, {
    params: {
      name: templateName,
      projectId,
      currentOrganizationId,
    },
  });
  return response?.data?.exists || false;
}
export async function editTemplate(templateId: number, template: Template): Promise<boolean> {
  const response: IResponse<boolean> = await request.put(
    `/api/v2/databasechange/changingorder/templates/${templateId}`,
    {
      data: template,
      params: {
        projectId: template?.projectId,
      },
    },
  );
  return response?.successful;
}

export async function detailTemplate(
  templateId: number,
  currentOrganizationId: string,
): Promise<Template> {
  const response: IResponse<Template> = await request.get(
    `/api/v2/databasechange/changingorder/templates/${templateId}`,
    {
      params: {
        currentOrganizationId,
      },
    },
  );
  return response?.data;
}

export async function deleteTemplate(
  templateId: number,
  currentOrganizationId: string,
): Promise<boolean> {
  const response: IResponse<boolean> = await request.delete(
    `/api/v2/databasechange/changingorder/templates/${templateId}`,
    {
      params: {
        currentOrganizationId,
      },
    },
  );
  return response?.successful;
}
export async function getTemplateList(
  args?: Partial<{
    projectId: number;
    currentOrganizationId: string;
    size: number;
    page: number;
  }>,
): Promise<IResponseData<Template>> {
  const response = await request.get('/api/v2/databasechange/changingorder/templates', {
    params: {
      size: 10,
      page: 1,
      ...args,
    },
  });
  return response?.data;
}
