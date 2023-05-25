import { IEnvironment } from '@/d.ts/environment';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function listEnvironments(): Promise<IEnvironment[]> {
  const ret = await request.get(`/api/v2/collaboration/environments`);
  return ret?.data.contents || [];
}

export async function updateEnvironment(id: number, data: IEnvironment): Promise<boolean> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      id: '@integer(0, 10000)',
      name: '@cword(3,6)',
      description: '@cparagraph(0,3)',
      rulesetId: '@integer(0, 10000)',
      rulesetName: '@cword(3,6)',
      organizationId: '@integer(0, 10000)',
      builtIn: '@boolean(1, 9, false)',
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
  });
  const ret = await request.put(`/api/v2/collaboration/environments/${id}`, data);
  return ret?.successful;
}

export async function getEnvironment(id: number): Promise<IEnvironment> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      id: '@integer(0, 10000)',
      name: '@cword(3,6)',
      description: '@cparagraph(0,3)',
      rulesetId: '@integer(0, 10000)',
      rulesetName: '@cword(3,6)',
      organizationId: '@integer(0, 10000)',
      builtIn: '@boolean(1, 9, false)',
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
  });
  const ret = await request.get(`/api/v2/collaboration/environments/${id}`);
  return ret?.data;
}
