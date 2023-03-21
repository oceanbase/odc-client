export default {
  'GET /api/v1/synonym/list/:sid': {
    data: [
      {
        synonymName: '同义词1',
        objectOwner: 'Owner 1',
        objectName: 'Object Name 1',
        ddl: 'test ddl string 1',
        gmtCreated: 111,
        gmtModified: 222,
      },
      {
        synonymName: '同义词2',
        objectOwner: 'Owner 2',
        objectName: 'Object Name 2',
        ddl: 'test ddl string 2',
        gmtCreated: 111,
        gmtModified: 222,
      },
      {
        synonymName: '同义词3',
        objectOwner: 'Owner 3',
        objectName: 'Object Name 3',
        ddl: 'test ddl string 3',
        gmtCreated: 111,
        gmtModified: 222,
      },
      {
        synonymName: '同义词4',
        objectOwner: 'Owner 4',
        objectName: 'Object Name 4',
        ddl: 'test ddl string 4',
        gmtCreated: 111,
        gmtModified: 222,
      },
      {
        synonymName: '同义词5',
        objectOwner: 'Owner 5',
        objectName: 'Object Name 5',
        ddl: 'test ddl string 5',
        gmtCreated: 111,
        gmtModified: 222,
      },
    ],
  },
  'GET /api/v1/synonym/:sid': {
    data: {
      synonymName: '同义词 xx',
      objectOwner: 'Owner xx',
      objectName: 'Object Name xx',
      ddl: 'test ddl string xx',
      gmtCreated: 111,
      gmtModified: 222,
    },
  },
  'POST /api/v1/synonym/getCreateSql/:sid': {
    data: {
      sql: 'create synonym test sql 1',
    },
  },
};
