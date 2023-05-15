import { IResponseData } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function listDatabases(
  projectId: number,
  dataSourceId: number,
  page: number,
  size: number,
  name?: string,
): Promise<IResponseData<IDatabase>> {
  return mockjs.mock({
    page: {
      totalElements: 200,
    },
    ['contents|' + size]: [
      {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        project: {
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
        dataSource: {
          id: '@integer(0, 10000)',
          name: '@cword(3,6)',
          type: 'OB_MYSQL',
          host: '@domain',
          port: '@integer(0, 10000)',
          username: '@cword(3,6)',
          password: '@string("lower", 0, 32)',
          clusterName: '@cword(3,6)',
          tenantName: '@cword(3,6)',
          enabled: '@boolean(1, 9, false)',
          status: {
            'args|1-3': ['@string("lower", 0, 32)'],
            errorCode: {},
            status: 'ACTIVE',
            type: 'OB_MYSQL',
            nextCheckTimeMillis: '@integer(0, 10000)',
            lastAccessTimeMillis: '@integer(0, 10000)',
          },
          environmentId: '@integer(0, 10000)',
          environmentName: '@cword(3,6)',
          passwordEncrypted: '@string("lower", 0, 32)',
          sysTenantUsername: '@cword(3,6)',
          sysTenantPassword: '@string("lower", 0, 32)',
          sysTenantPasswordEncrypted: '@string("lower", 0, 32)',
          cipher: 'RAW',
          salt: '@string("lower", 0, 32)',
          endpoint: {
            accessMode: 'DIRECT',
            host: '@domain',
            port: '@integer(0, 10000)',
            proxyHost: '@string("lower", 0, 32)',
            proxyPort: '@integer(0, 10000)',
            virtualHost: '@string("lower", 0, 32)',
            virtualPort: '@integer(0, 10000)',
          },
          sslConfig: {
            enabled: '@boolean(1, 9, false)',
            clientCertObjectId: '@guid',
            clientKeyObjectId: '@guid',
            CACertObjectId: '@guid',
          },
          sslFileEntry: {
            keyStoreFilePath: '@string("lower", 0, 32)',
            keyStoreFilePassword: '@string("lower", 0, 32)',
          },
          organizationId: '@integer(0, 10000)',
          properties: {},
        },
        syncStatus: 'FAILED',
        lastSyncTime: '@date',
        organizationId: '@integer(0, 10000)',
        charsetName: '@cword(3,6)',
        collationName: '@cword(3,6)',
        tableCount: '@integer(0, 10000)',
      },
    ],
    stats: {},
  });
  const res = await request.get(`/api/v2/database/databases`, {
    params: {
      projectId,
      dataSourceId,
      name,
      page,
      size,
    },
  });

  return res?.data;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export async function createDataBase(database: DeepPartial<IDatabase>): Promise<Boolean> {
  const res = await request.post(`/api/v2/database/databases`, {
    data: database,
  });
  return res?.data;
}
