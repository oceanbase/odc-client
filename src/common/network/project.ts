import { IResponseData } from '@/d.ts';
import { IProject, ProjectRole } from '@/d.ts/project';
import request from '@/util/request';

export async function listProjects(
  name: string = '',
  page: number,
  size: number,
  archived: boolean = false,
): Promise<IResponseData<IProject>> {
  const res = await request.get(`/api/v2/collaboration/projects`, {
    params: {
      name,
      page,
      size,
      archived,
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

export async function setProjectAchived(params: {
  projectId: number;
  archived: boolean;
}): Promise<boolean> {
  const res = await request.post(
    `/api/v2/collaboration/projects/${params?.projectId}/setArchived`,
    {
      data: {
        archived: params?.archived,
      },
    },
  );

  return !!res?.data;
}

export async function deleteProjectMember(params: {
  projectId: number;
  userId: number;
}): Promise<boolean> {
  const res = await request.delete(
    `/api/v2/collaboration/projects/${params?.projectId}/members/${params?.userId}`,
  );

  return !!res?.data;
}

export async function updateProjectMember(params: {
  projectId: number;
  userId: number;
  members: {
    id: number;
    role: ProjectRole;
  }[];
}): Promise<boolean> {
  const res = await request.put(
    `/api/v2/collaboration/projects/${params?.projectId}/members/${params?.userId}`,
    {
      data: params?.members,
    },
  );

  return !!res?.data;
}

export async function addProjectMember(params: {
  projectId: number;
  members: {
    id: number;
    role: ProjectRole;
  }[];
}): Promise<boolean> {
  const res = await request.post(`/api/v2/collaboration/projects/${params?.projectId}/members`, {
    data: params?.members,
  });

  return !!res?.data;
}
