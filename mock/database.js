export default {
  // 数据库列表
  '/api/v1/database/list/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      {
        sid: null,
        cid: null,
        name: 'oceanbase',
        charset: null,
        size: null,
        collation: null,
        properties: null,
        odcTables: null,
        odcFunctions: null,
        odcTablePartitions: null,
        odcProcedures: null,
        shardConfiguration: null,
        gmtCreated: null,
        gmtModified: null,
        metrics: null,
        users: null,
        odcTableViews: null,
      },
      {
        sid: null,
        cid: null,
        name: 'information_schema',
        charset: null,
        size: null,
        collation: null,
        properties: null,
        odcTables: null,
        odcFunctions: null,
        odcTablePartitions: null,
        odcProcedures: null,
        shardConfiguration: null,
        gmtCreated: null,
        gmtModified: null,
        metrics: null,
        users: null,
        odcTableViews: null,
      },
      {
        sid: null,
        cid: null,
        name: 'mysql',
        charset: null,
        size: null,
        collation: null,
        properties: null,
        odcTables: null,
        odcFunctions: null,
        odcTablePartitions: null,
        odcProcedures: null,
        shardConfiguration: null,
        gmtCreated: null,
        gmtModified: null,
        metrics: null,
        users: null,
        odcTableViews: null,
      },
      {
        sid: null,
        cid: null,
        name: 'odc_meta_center',
        charset: null,
        size: null,
        collation: null,
        properties: null,
        odcTables: null,
        odcFunctions: null,
        odcTablePartitions: null,
        odcProcedures: null,
        shardConfiguration: null,
        gmtCreated: null,
        gmtModified: null,
        metrics: null,
        users: null,
        odcTableViews: null,
      },
      {
        sid: null,
        cid: null,
        name: 'odcserver_db',
        charset: null,
        size: null,
        collation: null,
        properties: null,
        odcTables: null,
        odcFunctions: null,
        odcTablePartitions: null,
        odcProcedures: null,
        shardConfiguration: null,
        gmtCreated: null,
        gmtModified: null,
        metrics: null,
        users: null,
        odcTableViews: null,
      },
      {
        sid: null,
        cid: null,
        name: 'dbpconsole_db',
        charset: null,
        size: null,
        collation: null,
        properties: null,
        odcTables: null,
        odcFunctions: null,
        odcTablePartitions: null,
        odcProcedures: null,
        shardConfiguration: null,
        gmtCreated: null,
        gmtModified: null,
        metrics: null,
        users: null,
        odcTableViews: null,
      },
    ],
  },

  // 切换数据库
  'PUT /api/v1/database/switch/:sid': {
    data: true,
    errCode: null,
    errMsg: null,
  },

  // 数据库详情
  'GET /api/v1/database/:sid': {
    data: {
      collation: 'utf-8',
      charset: 'utf-8',
      size: '2000',
      gmtCreated: 1,
    },
  },

  // 数据库元信息
  'GET /api/v1/character/charset/list/:sid': {
    data: ['binary', 'utf8mb4'],
    errCode: null,
    errMsg: null,
  },

  'GET /api/v1/character/collation/list/:sid': {
    data: ['binary', 'utf8mb4_bin', 'utf8mb4_general_ci'],
    errCode: null,
    errMsg: null,
  },
  'GET /api/v1/version-config/datatype/list/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      { databaseType: 'FLOAT', showType: 'NUMERIC' },
      { databaseType: 'blob', showType: 'OBJECT' },
      { databaseType: 'LONGTEXT', showType: 'TEXT' },
      { databaseType: 'BINARY', showType: 'TEXT' },
      { databaseType: 'DECIMAL', showType: 'NUMERIC' },
      { databaseType: 'BIGINT', showType: 'NUMERIC' },
      { databaseType: 'TEXT', showType: 'TEXT' },
      { databaseType: 'TIME', showType: 'TEXT' },
      { databaseType: 'MEDIUMINT', showType: 'NUMERIC' },
      { databaseType: 'BIT', showType: 'NUMERIC' },
      { databaseType: 'varchar()', showType: 'TEXT' },
      { databaseType: 'int', showType: 'NUMERIC' },
      { databaseType: 'DATE', showType: 'TEXT' },
      { databaseType: 'DATETIME', showType: 'TEXT' },
      { databaseType: 'YEAR', showType: 'TEXT' },
      { databaseType: 'SMALLINT', showType: 'NUMERIC' },
      { databaseType: 'TIMESTAMP', showType: 'TEXT' },
      { databaseType: 'VARBINARY', showType: 'TEXT' },
      { databaseType: 'DOUBLE', showType: 'NUMERIC' },
      { databaseType: 'CHAR()', showType: 'TEXT' },
      { databaseType: 'TINYINT', showType: 'NUMERIC' },
      { databaseType: 'LONGBLOB', showType: 'OBJECT' },
    ],
  },
  

  // 是否支持修改分区表
  'GET /api/v1/version-config/partition/:sid': {
    errCode: null,
    errMsg: null,
    data: true,
  },
  // 是否支持函数
  'GET /api/v1/version-config/function/:sid': {
    errCode: null,
    errMsg: null,
    data: true,
  },
  // 是否支持存储过程
  'GET /api/v1/version-config/procedure/:sid': {
    errCode: null,
    errMsg: null,
    data: true,
  },
  // 是否支持视图
  'GET /api/v1/version-config/view/:sid': {
    errCode: null,
    errMsg: null,
    data: true,
  },
  // 是否支持序列
  'GET /api/v1/version-config/sequence/:sid': {
    errCode: null,
    errMsg: null,
    data: true,
  },

  // 是否支持程序包
  'GET /api/v1/version-config/package/:sid': {
    errCode: null,
    errMsg: null,
    data: true,
  },

  // 生成字段 SQL
  'PATCH /api/v1/column/getUpdateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/column/getDeleteSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/column/getCreateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },

  // 生成数据 SQL
  'PATCH /api/v1/data/getUpdateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/data/getDeleteSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/data/getCreateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },

  // 表结构变更 SQL
  'PATCH /api/v1/table/getUpdateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/table/getDeleteSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/table/getCreateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },

  // 索引变更 SQL
  'PATCH /api/v1/index/getDeleteSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/index/getCreateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  // 程序包 SQL
  'PATCH /api/v1/package/getUpdateSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/package/getDeleteSql/:sid': {
    data: {
      sql: 'UPDATE...',
    },
  },
  'PATCH /api/v1/package/getCreateSql/:sid': {
    data: {
      sql: `-- Created on 2020-06-11:12:00:00 by obdba\n
      declare 
        -- Local variables here
        i number;
      begin
        -- Test statements here
        
      end;`
    },
  },

  // 回收站
  '/api/v1/recyclebin/list/:sid': {
    data: new Array(400).fill(undefined).map((_, i) => ({
      createTime: {
        date: 0,
        day: 0,
        hours: 0,
        minutes: 0,
        month: 0,
        nanos: 0,
        seconds: 0,
        time: 0,
        timezoneOffset: 0,
        year: 0,
      },
      newName: '',
      objName: 'objName',
      objType: 'objType',
      originName: `${i}`,
      schema: 'schema',
    })),
    errCode: null,
    errMsg: null,
    importantMsg: false,
  },

  'PATCH /api/v1/recyclebin/getPurgeAllSql/:sid': {
    data: {
      sql: 'xxxx',
    },
  },

  'PATCH /api/v1/recyclebin/getDeleteSql/:sid': {
    data: {
      sql: 'xxxx',
    },
  },

  'PATCH /api/v1/recyclebin/getUpdateSql/:sid': {
    data: {
      sql: 'xxxx',
    },
  },

  'GET /api/v1/resultset/editable/:sid': async (req, res) => {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
        res.json({
          data: {
            editable: true,
            columnList: [
              {
                tableName: 'mysql',
                ordinalPosition: 1,
                columnName: 'LOG_NR_',
                dataType: 'int',
                length: null,
                allowNull: false,
                autoIncreament: true,
                defaultValue: null,
                comment: '',
              },
              {
                tableName: 'mysql',
                ordinalPosition: 2,
                columnName: 'TYPE_',
                dataType: 'varchar',
                dataShowType: 'TEXT',
                length: null,
                allowNull: true,
                autoIncreament: false,
                defaultValue: null,
                comment: '',
              },
              {
                tableName: 'mysql',
                ordinalPosition: 9,
                columnName: 'DATA_',
                dataType: 'blob',
                length: null,
                allowNull: true,
                autoIncreament: false,
                defaultValue: null,
                comment: '',
              },
            ],
          },
        });
      }, 1000);
    });
  },
};
