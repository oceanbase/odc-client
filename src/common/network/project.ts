import { IResponseData } from '@/d.ts';
import { IProject, ProjectRole } from '@/d.ts/project';
import request from '@/util/request';

export async function listProjects(
  name: string = '',
  page: number,
  size: number,
): Promise<IResponseData<IProject>> {
  const res = await request.get(`/api/v2/collaboration/projects`, {
    params: {
      name,
      page,
      size,
    },
  });

  return res?.data;
}

export async function getProject(id: number): Promise<IProject> {
  const res = await request.get(`/api/v2/collaboration/projects/${id}`);

  return res?.data;
}

export async function updateProject(id: number, project: IProject): Promise<IProject> {
  const res = await request.put(`/api/v2/collaboration/projects/${id}`, {
    data: project,
  });

  return res?.data;
}

export async function createProject(params: {
  name: string;
  description: string;
  members: {
    id: number;
    role: ProjectRole;
  }[];
}): Promise<IProject> {
  const res = await request.post(`/api/v2/collaboration/projects`, {
    data: params,
  });

  return res?.data;
}
