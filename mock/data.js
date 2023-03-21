// 上传下载文件，目前用于 BLOB 类型数据的管理
// @see https://yuque.antfin-inc.com/ob/platform/rgfghm
const mockJs = require('mockjs');
import { MOCK_CONNECT_LIST } from './session';
export default {
  'PUT /api/v1/data/object/download/:sid': {
    data: null,
    errMsg: '下载失败。。。',
  },

  'POST /api/v1/data/object/upload/:sid': {
    data: 'object@xx',
  },

  'GET /api/v1/data/transfer/list': {
    data: [
      {
        log: 'xx',
        status: 'INIT',
        taskId: '1.zip',
        taskType: 'IMPORT',
        userId: '128',
        createTime: 1610517145027,
        format: 'CSV',
        taskName: 'mocktask',
      },
      {
        log: 'xx',
        status: 'RUNNING',
        taskId: '2.zip',
        taskType: 'IMPORT',
        userId: '128',
        createTime: 1610516145027,
        format: 'SQL',
        taskName: 'mocktask',
      },
      {
        log: 'xx',
        status: 'SUCCESS',
        taskId: '3.zip',
        taskType: 'IMPORT',
        userId: '128',
        createTime: 1610515145027,
        format: 'SQL_FILE',
        taskName: 'mocktask',
      },
      {
        log: 'xx',
        status: 'SUCCESS',
        taskId: '4.zip',
        taskType: 'EXPORT',
        userId: '128',
        createTime: 1610517145027,
        format: 'ODC',
        taskName: 'mocktask',
      },
      {
        log: 'xx',
        status: 'TOBERETRY',
        taskId: '5.zip',
        taskType: 'EXPORT',
        userId: '128',
        createTime: 1610510145027,
        format: 'ODC',
        taskName: 'mocktask',
      },
    ],
  },

  'PUT /api/v1/data/transfer/retry': {
    data: true,
  },

  'PUT /api/v1/data/transfer/cancel': {
    data: false,
    errMsg: 'xxxx',
  },

  '/api/v1/data/transfer/detail': {
    data: {
      createTime: 1619437896638,
      dataObjectsInfo: [
        { count: 100, name: 'A_CHAR', schema: null, status: 'SUCCESS', total: 0, type: 'TABLE' },
      ],
      database: 'sailan',
      importFileSize: 0,
      log: '2021-04-26 19:51:36 [INFO] The manifest file: "/opt/odc/static/tmp/transfer/export/44BBECD4-2F80-4B0C-8AC3-37687854CA2B/data/MANIFEST.bin" has been saved\n2021-04-26 19:51:36 [INFO] Generate 1 sql dump tasks for table: A_CHAR in public cloud. Remain: 0\n2021-04-26 19:51:36 [INFO] Generate 1 dump tasks finished\n2021-04-26 19:51:36 [INFO] Start 8 record dump threads finished\n2021-04-26 19:51:37 [INFO] Dump 100 rows SAILAN.A_CHAR to "/opt/odc/static/tmp/transfer/export/44BBECD4-2F80-4B0C-8AC3-37687854CA2B/data/SAILAN/TABLE/A_CHAR.csv" finished\n2021-04-26 19:51:37 [INFO] Close count: 1\n',
      odcConnectionName: 'oracle_3.1_sl',
      progressPercentage: 100.0,
      retryCount: 0,
      retryTime: 0,
      schemaObjectsInfo: [],
      status: 'SUCCESS',
      taskConfig: {
        batchCommitNum: null,
        csvColumnMappings: null,
        csvConfig: {
          AccessKeyId: null,
          CallerBid: null,
          CallerType: null,
          CallerUid: null,
          InstanceId: null,
          RequestId: null,
          SecurityToken: null,
          TenantId: null,
          UID: null,
          blankToNull: true,
          columnDelimiter: "'",
          columnSeparator: ',',
          encoding: 'UTF_8',
          fileName: null,
          lineSeparator: '\\n',
          pageNumber: 1,
          pageSize: 10,
          regionId: null,
          skipHeader: false,
        },
        dataTransferFormat: 'CSV',
        encoding: 'UTF_8',
        exportDbObjects: [{ dbObjectType: 'TABLE', objectName: 'A_CHAR' }],
        fileType: 'ZIP',
        globalSnapshot: false,
        importFileName: null,
        overwriteSysConfig: false,
        replaceSchemaWhenExists: false,
        skippedDataType: [],
        stopWhenError: false,
        sysPassword: null,
        sysUser: null,
        taskId: '44BBECD4-2F80-4B0C-8AC3-37687854CA2B',
        taskName: 'oracle_3.1_sl_sailan_20210426195135',
        transferDDL: false,
        transferData: true,
        transferType: 'EXPORT',
        truncateTableBeforeImport: false,
        withDropDDL: false,
      },
      taskId: '44BBECD4-2F80-4B0C-8AC3-37687854CA2B',
    },
    durationMillis: 0,
    errCode: null,
    errMsg: null,
    importantMsg: false,
    server: '6b78c3eff52e',
    timestamp: 1619438322.877,
    traceId: '81a81e300e7b49b6',
  },

  'POST /api/v1/data/transfer/create': {
    data: true,
  },

  '/api/v1/data/transfer/getExportObjects/:sid': {
    data: {
      TABLE: ['table1', 'table2'],
      VIEW: ['view1', 'view2'],
      FUNCTION: ['fun1', 'fun2'],
      TRIGGER: ['tri1', 'tri2'],
      SYNONYM: ['syn1'],
      PUBLIC_SYNONYM: ['pub_syn1'],
    },
  },

  'POST /api/v1/data/transfer/upload': {
    data: 'uploadFileName',
  },
  'PUT /api/v1/data/transfer/getCsvFileInfo': {
    data: [
      {
        firstLineValue: '1',
        srcColumnName: 'csv_column1',
        srcColumnPosition: 1,
      },
      {
        firstLineValue: '2',
        srcColumnName: 'csv_column12',
        srcColumnPosition: 2,
      },
      {
        firstLineValue: '3',
        srcColumnName: 'csv_column13',
        srcColumnPosition: 3,
      },
      {
        firstLineValue: '4',
        srcColumnName: 'csv_column14',
        srcColumnPosition: 4,
      },
    ],
  },

  'POST /api/v1/data/transfer/upload/:sid': {
    data: 'uploadFileName',
  },

  'POST /api/v1/file/startTask/:sid': {
    errCode: null,
    errMsg: null,
    data: 'file_1604564326610',
    importantMsg: false,
  },

  'GET /api/v1/file/getProcess/:sid': {
    errCode: null,
    errMsg: null,
    data: 100,
    importantMsg: false,
  },

  'GET /api/v2/iam/users': {
    data: {
      ...mockJs.mock({
        'contents|20-100': [
          {
            'id|1-100': 1,
            'accountName|1-15': /\w/,
            'name|1-15': /\w/,
            roleIds: [1, 2, 3, 4, 5],
            'enabled|1': [true, false],
            'description|1-15': /\w/,
            'creatorName|1-15': /\w/,
            'createTime|1610510145027-1610519145027': 1,
            'updateTime|1610510145027-1610519145027': 1,
            'loginTime|1610510145027-1610519145027': 1,
            ...mockJs.mock({
              'permissions|1-10': [
                {
                  'id|1-100': 1,
                  'userId|1-100': 1,
                  'resourceIdentifier|1-100': 1,
                  'action|1-40': /\w/,
                },
              ],
            }),
          },
        ],
      }),
      page: {
        number: 10,
        size: 10,
        totalElements: 100,
        totalPages: 100,
      },
    },
  },
  'GET /api/v1/manage/user/exist': {
    data: false,
  },
  'GET /api/v2/iam/users/:uid': mockJs.mock({
    data: {
      'id|1-100': 1,
      'accountName|1-15': /\w/,
      'name|1-15': /\w/,
      roleIds: [1, 2, 3, 4, 5],
      'enabled|1': [true, false],
      'description|1-15': /\w/,
      'creatorName|1-15': /\w/,
      'createTime|1610510145027-1610519145027': 1,
      'updateTime|1610510145027-1610519145027': 1,
      'loginTime|1610510145027-1610519145027': 1,
      ...mockJs.mock({
        'permissions|1-10': [
          {
            'id|1-100': 1,
            'userId|1-100': 1,
            'resourceIdentifier|1-100': 1,
            'action|1-40': /\w/,
          },
        ],
      }),
    },
  }),

  'GET /api/v2/iam/roles': {
    ...mockJs.mock({
      'data|10-50': [
        {
          'id|1-100': 1,
          'name|1-15': /\w/,
          'enabled|1': [true, false],
          'description|1-15': /\w/,
          'creatorName|1-15': /\w/,
          'createTime|1610510145027-1610519145027': 1,
          'updateTime|1610510145027-1610519145027': 1,
          systemPermissions: [
            {
              'resourceIdentifier|1': [
                'public_connection',
                'resource_groups',
                'user',
                'role',
                'system_config',
              ],
              actions: ['CREATE', 'DELETE', 'UPDATE', 'VIEW'],
            },
          ],
          ...mockJs.mock({
            'publicResourcePermissions|5-10': [
              {
                'resourceIdentifier|1': [
                  'public_connection',
                  'resource_groups',
                  'user',
                  'role',
                  'system_config',
                ],
                actions: ['CREATE', 'DELETE', 'UPDATE', 'VIEW'],
              },
            ],
          }),
        },
      ],
    }),
  },

  'GET /api/v2/iam/roles/:uid': mockJs.mock({
    data: {
      'id|1-100': 1,
      'name|1-15': /\w/,
      'enabled|1': [true, false],
      'description|1-15': /\w/,
      'creatorName|1-15': /\w/,
      'createTime|1610510145027-1610519145027': 1,
      'updateTime|1610510145027-1610519145027': 1,
      systemPermissions: [
        {
          'resourceIdentifier|1': [
            'public_connection',
            'resource_groups',
            'user',
            'role',
            'system_config',
          ],
          actions: ['CREATE', 'DELETE', 'UPDATE', 'VIEW'],
        },
      ],
      ...mockJs.mock({
        'publicResourcePermissions|5-10': [
          {
            'resourceIdentifier|1': [
              'public_connection',
              'resource_groups',
              'user',
              'role',
              'system_config',
            ],
            actions: ['CREATE', 'DELETE', 'UPDATE', 'VIEW'],
          },
        ],
      }),
    },
  }),

  'GET /api/v2/connect/connections/:uid': mockJs.mock({
    data: {
      'id|1-100': 1,
      'userId|10-1000': 1,
      'name|10-60': /\w/,
      'dialectType|1': ['MYSQL', 'ORACLE', 'OB_MYSQL', 'OB_ORACLE', 'OB_SHARDING'],
      'visibleScopeEnum|1': ['PRIVATE', 'ENTERPRISE'],
      'host|@ip': 1,
      port: function () {
        return mockJs.mock('@integer(4,5)');
      },
      clusterName: function () {
        return mockJs.mock('@first');
      },
      tenantName: function () {
        return mockJs.mock('@first');
      },
      'username|10-60': /\w/,
      'sysTenantUsername|10-60': /\w/,
      'passwordUnencrypted|8-20': /\w/,
      'sysTenantPassword|8-20': /\w/,
      'defaultSchema|10-60': /\w/,
      'queryTimeoutSeconds|10-1000': 1,
      'createTime|1610530145027-1610539145027': 1,
      'updateTime|1610530145027-1610539145027': 1,
      'active|1-2': true,
      properties: {},
      'copyFromSid|1-15': /\w/,
      'creator|1-15': /\w/,
      ...mockJs.mock({
        'resourceGroupIds|1-1': [
          {
            'id|1-100': /\w/,
            'name|10-60': /\w/,
          },
        ],
      }),
    },
  }),

  'GET /api/v2/resource/resourcegroups/': {
    ...mockJs.mock({
      'data|20-50': [
        {
          'id|1-100': 1,
          'name|10-60': /\w/,
          'userId|10-1000': 1,
          'creator|10-60': /\w/,
          'description|1-200': /\w/,
          'active|1': [true, false],
          'createTime|1610530145027-1610539145027': 1,
          'updateTime|1610530145027-1610539145027': 1,
          ...mockJs.mock({
            'connections|2-5': [
              {
                'id|1-100': 1,
                'name|10-60': /\w/,
                'active|1': [true, false],
              },
            ],
          }),
        },
      ],
    }),
  },

  'GET /api/v2/resource/resourcegroups/:uid': mockJs.mock({
    data: {
      'id|1-100': 1,
      'name|10-60': /\w/,
      'userId|10-1000': 1,
      'creator|10-60': /\w/,
      'description|1-200': /\w/,
      'active|1': [true, false],
      'createTime|1610530145027-1610539145027': 1,
      'updateTime|1610530145027-1610539145027': 1,
      ...mockJs.mock({
        'connections|2-5': [
          {
            'id|1-100': 1,
            'name|10-60': /\w/,
            'active|1': [true, false],
          },
        ],
      }),
    },
  }),

  'GET /api/v2/iam/users/:id/relatedResources': {
    data: {
      contents: {
        'action|1': ['readonlyconnect', 'connect'],
        'resourceGroupName|10-20': /\w/,
        'resourceName|10-20': /\w/,
      },
    },
  },
};
