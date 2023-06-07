import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function updateRiskDetectRule(
  id: number,
  riskDetectRule: IRiskDetectRule,
): Promise<boolean> {
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
      organizationId: '@integer(0, 10000)',
      'conditions|1-3': [
        {
          id: '@integer(0, 10000)',
          ruleId: '@integer(0, 10000)',
          expression: '@string("lower", 0, 32)',
          operation: '@string("lower", 0, 32)',
          value: '@string("lower", 0, 32)',
        },
      ],
      action: {
        id: '@integer(0, 10000)',
        level: '@integer(0, 10000)',
        description: '@cparagraph(0,3)',
        organizationId: '@integer(0, 10000)',
      },
      creator: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
    },
  })?.successful;
  const ret = await request.put(`/api/v2/regulation/riskDetectRules/${id}`, riskDetectRule);
  return ret?.successful;
}

export async function listRiskDetectRules(): Promise<IRiskDetectRule[]> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      'contents|9-12': [
        {
          id: '@integer(0, 10000)',
          'name|+1': ['默认风险', '低风险', '中风险', '高风险'],
          organizationId: '@integer(0, 10000)',
          'conditions|1-3': [
            {
              id: '@integer(0, 10000)',
              ruleId: '@integer(0, 10000)',
              expression: '@string("lower", 1, 32)',
              'operation|1': [
                'equal',
                'unequal',
                'lessThan',
                'greaterThan',
                'lessThanOrEqual',
                'greaterThanOrEqual',
              ],
              'value|1': ['dev', 'test', 'prod'],
            },
          ],
          action: {
            id: '@integer(0, 10000)',
            level: '@integer(0, 10000)',
            description: '@cparagraph(0,3)',
            organizationId: '@integer(0, 10000)',
          },
          creator: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            accountName: '@cword(3,6)',
            'roleNames|1-3': ['@string("lower", 0, 32)'],
          },
        },
      ],
      stats: {},
    },
  })?.data?.contents;
  const ret = await request.get(`/api/v2/regulation/riskDetectRules`);
  return ret?.data?.contents;
}

export async function detailRiskDetectRule(id: number): Promise<IRiskDetectRule> {
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
      organizationId: '@integer(0, 10000)',
      'conditions|1-3': [
        {
          id: '@integer(0, 10000)',
          ruleId: '@integer(0, 10000)',
          expression: '@string("lower", 0, 32)',
          operation: '@string("lower", 0, 32)',
          value: '@string("lower", 0, 32)',
        },
      ],
      action: {
        id: '@integer(0, 10000)',
        level: '@integer(0, 10000)',
        description: '@cparagraph(0,3)',
        organizationId: '@integer(0, 10000)',
      },
      creator: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
    },
  })?.data;
  const ret = await request.get(`/api/v2/regulation/riskDetectRules/${id}`);
  return ret?.data;
}

export async function deleteRiskDetectRule(id: number): Promise<boolean> {
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
      organizationId: '@integer(0, 10000)',
      'conditions|1-3': [
        {
          id: '@integer(0, 10000)',
          ruleId: '@integer(0, 10000)',
          expression: '@string("lower", 0, 32)',
          operation: '@string("lower", 0, 32)',
          value: '@string("lower", 0, 32)',
        },
      ],
      action: {
        id: '@integer(0, 10000)',
        level: '@integer(0, 10000)',
        description: '@cparagraph(0,3)',
        organizationId: '@integer(0, 10000)',
      },
      creator: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
    },
  })?.successful;
  const ret = await request.delete(`/api/v2/regulation/riskDetectRules/${id}`);
  return ret?.successful;
}

export async function createRiskDetectRules(risDetectRule: IRiskDetectRule): Promise<boolean> {
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
      organizationId: '@integer(0, 10000)',
      'conditions|1-3': [
        {
          id: '@integer(0, 10000)',
          ruleId: '@integer(0, 10000)',
          expression: '@string("lower", 0, 32)',
          operation: '@string("lower", 0, 32)',
          value: '@string("lower", 0, 32)',
        },
      ],
      action: {
        id: '@integer(0, 10000)',
        level: '@integer(0, 10000)',
        description: '@cparagraph(0,3)',
        organizationId: '@integer(0, 10000)',
      },
      creator: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
    },
  })?.successful;
  const ret = await request.post(`/api/v2/regulation/riskDetectRules`, risDetectRule);
  return ret?.successful;
}
