import { IRiskLevel } from '@/d.ts/riskLevel';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function updateRiskLevel(id: number, riskLevel: IRiskLevel): Promise<boolean> {
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
      level: '@integer(0, 10000)',
      description: '@cparagraph(0,3)',
      organizationId: '@integer(0, 10000)',
    },
  })?.successful;
  const ret = await request.put(`/api/v2/regulation/risklevels/${id}`, riskLevel);
  return ret?.successful;
}

export async function listRiskLevels(): Promise<IRiskLevel[]> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      'contents|1-4': [
        {
          id: '@integer(0, 10000)',
          level: '@integer(0, 10000)',
          description: '@cparagraph(0,3)',
          organizationId: '@integer(0, 10000)',
        },
      ],
      stats: {},
    },
  })?.data?.contents;
  const ret = await request.get(`/api/v2/regulation/risklevels`);
  return ret?.data?.contents;
}

export async function detailRiskLevel(id: number): Promise<IRiskLevel> {
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
      level: '@integer(0, 10000)',
      description: '@cparagraph(0,3)',
      organizationId: '@integer(0, 10000)',
    },
  })?.data;
  const ret = await request.get(`/api/v2/regulation/risklevels/${id}`);
  return ret?.data;
}
