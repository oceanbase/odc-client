import { Rule, Ruleset } from '@/d.ts/environment';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function updateRuleset(id: number, rule: Ruleset): Promise<boolean> {
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
      'rules|1-3': [
        {
          id: '@integer(0, 10000)',
          metadata: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'SQL_CHECK',
            'subTypes|1-3': ['@string("lower", 0, 32)'],
            'supportedDialectTypes|1-3': ['OB_MYSQL'],
            'propertyMetadatas|1-3': [
              {
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'BOOLEAN',
                componentType: 'INPUT_STRING',
                defaultValue: {},
                'candidates|1-3': [{}],
              },
            ],
            builtIn: '@boolean(1, 9, false)',
          },
          rulesetId: '@integer(0, 10000)',
          level: '@integer(0, 10000)',
          'appliedDialectTypes|1-3': ['OB_MYSQL'],
          properties: {},
          enabled: '@boolean(1, 9, false)',
          organizationId: '@integer(0, 10000)',
          createTime: '@date',
          updateTime: '@date',
        },
      ],
      organizationId: '@integer(0, 10000)',
      builtin: '@boolean(1, 9, false)',
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
  const ret = await request.put(`/api/v2/regulation/rulesets/${id}`, rule);
  return ret?.successful;
}

export async function updateRule(
  rulesetId: number,
  ruleId: number,
  rule: Ruleset,
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
      metadata: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        description: '@cparagraph(0,3)',
        type: 'SQL_CHECK',
        'subTypes|1-3': ['@string("lower", 0, 32)'],
        'supportedDialectTypes|1-3': ['OB_MYSQL'],
        'propertyMetadatas|1-3': [
          {
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'BOOLEAN',
            componentType: 'INPUT_STRING',
            defaultValue: {},
            'candidates|1-3': [{}],
          },
        ],
        builtIn: '@boolean(1, 9, false)',
      },
      rulesetId: '@integer(0, 10000)',
      level: '@integer(0, 10000)',
      'appliedDialectTypes|1-3': ['OB_MYSQL'],
      properties: {},
      enabled: '@boolean(1, 9, false)',
      organizationId: '@integer(0, 10000)',
      createTime: '@date',
      updateTime: '@date',
    },
  });
  const ret = await request.put(`/api/v2/regulation/rulesets/${rulesetId}/rules/${ruleId}`, rule);
  return ret?.successful;
}

export async function listRulesets(): Promise<Ruleset[]> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      page: {
        totalElements: '@integer(0, 10000)',
        totalPages: '@integer(0, 10000)',
        number: '@integer(0, 10000)',
        size: '@integer(0, 10000)',
      },
      'contents|1-3': [
        {
          id: '@integer(0, 10000)',
          name: '@cword(3,6)',
          description: '@cparagraph(0,3)',
          'rules|1-3': [
            {
              id: '@integer(0, 10000)',
              metadata: {
                id: '@integer(0, 10000)',
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'SQL_CHECK',
                'subTypes|1-3': ['@string("lower", 0, 32)'],
                'supportedDialectTypes|1-3': ['OB_MYSQL'],
                'propertyMetadatas|1-3': [
                  {
                    name: '@cword(3,6)',
                    description: '@cparagraph(0,3)',
                    type: 'BOOLEAN',
                    componentType: 'INPUT_STRING',
                    defaultValue: {},
                    'candidates|1-3': [{}],
                  },
                ],
                builtIn: '@boolean(1, 9, false)',
              },
              rulesetId: '@integer(0, 10000)',
              level: '@integer(0, 10000)',
              'appliedDialectTypes|1-3': ['OB_MYSQL'],
              properties: {},
              enabled: '@boolean(1, 9, false)',
              organizationId: '@integer(0, 10000)',
              createTime: '@date',
              updateTime: '@date',
            },
          ],
          organizationId: '@integer(0, 10000)',
          builtin: '@boolean(1, 9, false)',
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
    },
  })?.data?.contents;
  const ret = await request.get(`/api/v2/regulation/rulesets`);
  return ret?.data?.contents || [];
}

export async function listRules(rulesetId: number): Promise<Rule> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      page: {
        totalElements: '@integer(0, 10000)',
        totalPages: '@integer(0, 10000)',
        number: '@integer(0, 10000)',
        size: '@integer(0, 10000)',
      },
      'contents|1-3': [
        {
          id: '@integer(0, 10000)',
          metadata: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'SQL_CHECK',
            'subTypes|1-3': ['@string("lower", 0, 32)'],
            'supportedDialectTypes|1-3': ['OB_MYSQL'],
            'propertyMetadatas|1-3': [
              {
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'BOOLEAN',
                componentType: 'INPUT_STRING',
                defaultValue: {},
                'candidates|1-3': [{}],
              },
            ],
            builtIn: '@boolean(1, 9, false)',
          },
          rulesetId: '@integer(0, 10000)',
          level: '@integer(0, 10000)',
          'appliedDialectTypes|1-3': ['OB_MYSQL'],
          properties: {},
          enabled: '@boolean(1, 9, false)',
          organizationId: '@integer(0, 10000)',
          createTime: '@date',
          updateTime: '@date',
        },
      ],
      stats: {},
    },
  });
  const ret = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules`);
  return ret?.successful;
}

export async function getRuleset(id: number): Promise<Ruleset[]> {
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
      'rules|1-3': [
        {
          id: '@integer(0, 10000)',
          metadata: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'SQL_CHECK',
            'subTypes|1-3': ['@string("lower", 0, 32)'],
            'supportedDialectTypes|1-3': ['OB_MYSQL'],
            'propertyMetadatas|1-3': [
              {
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'BOOLEAN',
                componentType: 'INPUT_STRING',
                defaultValue: {},
                'candidates|1-3': [{}],
              },
            ],
            builtIn: '@boolean(1, 9, false)',
          },
          rulesetId: '@integer(0, 10000)',
          level: '@integer(0, 10000)',
          'appliedDialectTypes|1-3': ['OB_MYSQL'],
          properties: {},
          enabled: '@boolean(1, 9, false)',
          organizationId: '@integer(0, 10000)',
          createTime: '@date',
          updateTime: '@date',
        },
      ],
      organizationId: '@integer(0, 10000)',
      builtin: '@boolean(1, 9, false)',
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

  const ret = await request.get(`/api/v2/regulation/rulesets/${id}`);
  return ret?.data || {};
}

export async function getRule(rulesetId: number, ruleId: number): Promise<Rule> {
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
      metadata: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        description: '@cparagraph(0,3)',
        type: 'SQL_CHECK',
        'subTypes|1-3': ['@string("lower", 0, 32)'],
        'supportedDialectTypes|1-3': ['OB_MYSQL'],
        'propertyMetadatas|1-3': [
          {
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'BOOLEAN',
            componentType: 'INPUT_STRING',
            defaultValue: {},
            'candidates|1-3': [{}],
          },
        ],
        builtIn: '@boolean(1, 9, false)',
      },
      rulesetId: '@integer(0, 10000)',
      level: '@integer(0, 10000)',
      'appliedDialectTypes|1-3': ['OB_MYSQL'],
      properties: {},
      enabled: '@boolean(1, 9, false)',
      organizationId: '@integer(0, 10000)',
      createTime: '@date',
      updateTime: '@date',
    },
  });
  const ret = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules/${ruleId}`);
  return ret?.data;
}

export async function createRuleset(ruleset: Ruleset): Promise<boolean> {
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
      'rules|1-3': [
        {
          id: '@integer(0, 10000)',
          metadata: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'SQL_CHECK',
            'subTypes|1-3': ['@string("lower", 0, 32)'],
            'supportedDialectTypes|1-3': ['OB_MYSQL'],
            'propertyMetadatas|1-3': [
              {
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'BOOLEAN',
                componentType: 'INPUT_STRING',
                defaultValue: {},
                'candidates|1-3': [{}],
              },
            ],
            builtIn: '@boolean(1, 9, false)',
          },
          rulesetId: '@integer(0, 10000)',
          level: '@integer(0, 10000)',
          'appliedDialectTypes|1-3': ['OB_MYSQL'],
          properties: {},
          enabled: '@boolean(1, 9, false)',
          organizationId: '@integer(0, 10000)',
          createTime: '@date',
          updateTime: '@date',
        },
      ],
      organizationId: '@integer(0, 10000)',
      builtin: '@boolean(1, 9, false)',
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
  const ret = await request.post(`/api/v2/regulation/rulesets`, ruleset);
  return ret?.successful;
}
