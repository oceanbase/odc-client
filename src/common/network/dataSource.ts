import { IResponseData } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function listDataSources(
  name: string = '',
  page: number,
  size: number,
  projectName?: string,
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
        id: '@id',
        name: '@name',
        type: 'OB_MYSQL',
        host: 'jmrxpdpxs.is',
        port: 4385,
        username: '明公后位',
        password: 'stywdyxbc',
        clusterName: '备型织细导',
        tenantName: '术际这见例',
        enabled: true,
        status: {
          args: ['uqjometaiujvn', 'uvrxrtykxnohvpvcltk'],
          errorCode: {},
          status: 'ACTIVE',
          type: 'OB_MYSQL',
          nextCheckTimeMillis: 54,
          lastAccessTimeMillis: 1856,
        },
        environmentId: 9581,
        environmentName: '平现技得展',
        passwordEncrypted: 'wiumhrbkjcpdgtptlxnwznemv',
        sysTenantUsername: '众合对内则么',
        sysTenantPassword: 'xwdjwjdyhvjncdr',
        sysTenantPasswordEncrypted: 'fhfkkpdztpmyiufxkrjhmomqhb',
        cipher: 'RAW',
        salt: 'eodnxorujimtmcpwkdxjnqcqw',
        endpoint: {
          accessMode: 'DIRECT',
          host: 'nclu.fr',
          port: 8392,
          proxyHost: 'cbvyvciyhccyc',
          proxyPort: 4851,
          virtualHost: 'uzvcuckeilhambzhpmumrqdkme',
          virtualPort: 9305,
        },
        sslConfig: {
          enabled: true,
          clientCertObjectId: '6f4B8DB0-4CbD-2CdE-Ea69-BD5A6bbeEbd6',
          clientKeyObjectId: 'F74A647f-7421-06B6-D1D6-7cbcfed67F85',
          CACertObjectId: 'ACDEEceF-bf87-0b6b-cAf4-EB2322FdE9eE',
        },
        sslFileEntry: {
          keyStoreFilePath: 'qjtftbeus',
          keyStoreFilePassword: 'lcchoyvcpvweyvkljkkj',
        },
        organizationId: 7169,
        properties: {},
      },
    ],
    stats: {},
  });
  const res = await request.get(`/api/v2/datasource/datasources`, {
    params: {
      name,
      page,
      size,
      projectName,
    },
  });

  return res?.data;
}

export async function getDataSource(id: number): Promise<IDatasource> {
  const res = await request.get(`/api/v2/datasource/datasources/${id}`);
  return res?.data;
}
