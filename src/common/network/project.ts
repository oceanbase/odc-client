import { IResponseData } from '@/d.ts';
import { IProject } from '@/d.ts/project';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function listProjects(
  name: string = '',
  page: number,
  size: number,
): Promise<IResponseData<IProject>> {
  return mockjs.mock({
    page: {
      totalElements: '@integer(0, 10000)',
      totalPages: '@integer(0, 10000)',
      number: '@integer(0, 10000)',
      size: '@integer(0, 10000)',
    },
    'contents|20': [
      {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        description: '@cparagraph(0,3)',
        'members|1-3': [
          {
            id: '@integer(0, 10000)',
            accountName: '@cword(3,6)',
            name: '@cword(3,6)',
            role: 'DEVELOPER',
          },
        ],
        builtin: '@boolean(1, 9, false)',
        organizationId: '@integer(0, 10000)',
        createTime: '@date',
        updateTime: '@date',
        creator: {
          id: '@integer(0, 10000)',
          name: '@cword(3,6)',
          accountName: '@cword(3,6)',
          'roleNames|1-3': ['@string("lower", 0, 32)'],
        },
        lastModifier: {
          id: '@integer(0, 10000)',
          name: '@cword(3,6)',
          accountName: '@cword(3,6)',
          'roleNames|1-3': ['@string("lower", 0, 32)'],
        },
      },
    ],
    stats: {},
  });
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
  return mockjs.mock({
    id: 3864,
    name: '光主专受',
    description: '',
    'members|50': [
      {
        id: '@id',
        accountName: '@cword(3,10)',
        name: '@cword(3,20)',
        role: 'DEVELOPER',
      },
    ],
    builtin: false,
    organizationId: 9115,
    createTime: '2003-07-31',
    updateTime: '1974-05-17',
    creator: {
      id: 69,
      name: '感公照格报',
      accountName: '且全议样间',
      roleNames: ['shchptnca'],
    },
    lastModifier: {
      id: 2352,
      name: '联风观五战',
      accountName: '间习红',
      roleNames: ['j', 'weryywjwpizwljdmvebcvkmp'],
    },
  });
  const res = await request.get(`/api/v2/collaboration/projects/${id}`);

  return res?.data;
}

export async function updateProject(id: number, project: IProject): Promise<IProject> {
  return mockjs.mock({
    id: 3864,
    name: '光主专受',
    description: '',
    'members|100': [
      {
        id: 9216,
        accountName: '工全总',
        name: '华当一飞求合',
        role: 'DEVELOPER',
      },
      {
        id: 9391,
        accountName: '今派传行命',
        name: '政快去眼',
        role: 'DEVELOPER',
      },
      {
        id: 6070,
        accountName: '料厂条天',
        name: '月价下认连外',
        role: 'DEVELOPER',
      },
    ],
    builtin: false,
    organizationId: 9115,
    createTime: '2003-07-31',
    updateTime: '1974-05-17',
    creator: {
      id: 69,
      name: '感公照格报',
      accountName: '且全议样间',
      roleNames: ['shchptnca'],
    },
    lastModifier: {
      id: 2352,
      name: '联风观五战',
      accountName: '间习红',
      roleNames: ['j', 'weryywjwpizwljdmvebcvkmp'],
    },
  });
  const res = await request.put(`/api/v2/collaboration/projects/${id}`);

  return res?.data;
}
