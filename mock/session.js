const mockJs = require('mockjs');

export const MOCK_CONNECT_LIST = mockJs.mock({
  'data|1-20': [
    {
      'id|1-100': 1,
      'ownerId|10-1000': 1,
      'organizationId|10-1000': 1,
      'creatorId|10-1000': 1,
      'creator|10-60': /\w/,
      'name|10-60': /\w/,
      'dialectType|1': ['MYSQL', 'ORACLE', 'OB_MYSQL', 'OB_ORACLE', 'OB_SHARDING'],
      'visibleScope|1': ['PRIVATE', 'ORGANIZATION'],
      host: '100.69.96.13:10117',
      port: function () {
        return mockJs.mock('@integer(4,5)');
      },
      clusterName: function () {
        return mockJs.mock('@first');
      },
      tenantName: function () {
        return mockJs.mock('@first');
      },
      'username|8-10': /\w/,
      'password|8-10': /\w/,
      'passwordEncrypted|8-10': /\w/,
      'sysTenantUsername|8-10': /\w/,
      'sysTenantPassword|8-10': /\w/,
      'sysTenantPasswordEncrypted|8-10': /\w/,
      'readonlyUsername|8-10': /\w/,
      'readonlyPassword|8-10': /\w/,
      'readonlyPasswordEncrypted|8-10': /\w/,
      'defaultSchema|8-10': /\w/,
      'createTime|1610530145027-1610539145027': 1,
      'updateTime|1610530145027-1610539145027': 1,
      'queryTimeoutSeconds|0-10': 1,
      'status|1': ['ACTIVE', 'INACTIVE', 'TESTING', 'UNKNOWN'],
      properties: {},
      'copyFromId|1-1000': 1,
      'lastAccessTime|1610530145027-1610539145027': 1,
      'enabled|1': [true, false],
      'passwordSaved|1': [true, false],
      'cipher|1': ['RAW', 'BCRYPT', 'AES256SALT'],
      'salt|8-10': /\w/,
      ...mockJs.mock({
        'resourceGroups|1-1': [
          {
            'id|10-1000': 1,
            'name|10-60': /\w/,
          },
        ],
      }),
    },
  ],
}).data;

export default {
  '/api/v1/heartbeat/:sid': {},
  'PUT /api/v1/session/test': {
    data: true,
    // errCode: '500',
    // errMsg: '连接失败',
  },
  'DELETE /api/v1/session/sid:sid': {},
  'POST /api/v1/session/:userId': {},
  'PUT /api/v1/session/:sid': {},
  // 开启连接
  'POST /api/v1/session/connect/:sid': async (req, res) => {
    const { sid } = req.params;
    await res.json({
      data: `${sid}-42`,
    });
  },
  // 关闭连接
  'PUT /api/v1/session/close/sid:sid': {},
  'GET /api/v1/session/:sid': async (req, res) => {
    const { sid } = req.params;
    const sidStr = sid.replace('sid:', ''); // sid:33-42
    const sidNumber = sidStr.split('-')[0];
    const targetConnect = MOCK_CONNECT_LIST.find((item) => item.sid == sidNumber);
    await res.json({
      data: targetConnect,
    });
  },

  'GET /api/v2/connect/connections': {
    // errorCode: 500,
    // errorMessage: 'error',
    data: {
      contents: MOCK_CONNECT_LIST,
    },
  },

  'GET /api/v1/session/testBatch': {
    errCode: null,
    errMsg: null,
    data: [
      {
        active: true,
        sid: '27',
      },
    ],
    importantMsg: false,
  },

  'GET /api/v1/session-label/list/:sid': {
    errCode: null,
    errMsg: null,
    ...mockJs.mock({
      'data|1-10': [
        {
          'gmtCreated|1610520145027-1610529145027': 1,
          'gmtModified|1610510145027-1610519145027': 1,
          'id|1-1000': 1,
          labelColor: 'color1',
          'labelName|1-10': /\w/,
          userId: 1000105,
        },
      ],
    }),
    importantMsg: false,
  },
  'GET /api/v1/version-config/getSupportFeatures/:sid': async (req, res) => {
    await res.json({
      errCode: null,
      errMsg: null,
      data: [
        { supportType: 'support_view', support: true },
        { supportType: 'support_procedure', support: true },
        { supportType: 'support_function', support: true },
        { supportType: 'support_partition_modify', support: true },
        { supportType: 'support_sequence', support: true },
        { supportType: 'support_package', support: true },
        { supportType: 'support_constraint_modify', support: true },
        { supportType: 'support_pl_debug', support: true },
        { supportType: 'support_rowid', support: false },
        { supportType: 'support_trigger', support: true },
        { supportType: 'support_type', support: true },
        { supportType: 'support_synonym', support: true },
      ],
      importantMsg: false,
    });
  },

  // 连接参数
  'GET /api/v1/variables/list/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      {
        key: 'autocommit',
        value: 'ON',
        changed: false,
        valueType: 'enum',
        valueEnums: ['ON', 'OFF'],
      },
      { key: 'connect_timeout', value: '10', changed: false, valueType: 'numeric' },
      { key: 'interactive_timeout', value: '28800', changed: false, valueType: 'numeric' },
      { key: 'last_insert_id', value: '0', changed: false },
      { key: 'max_allowed_packet', value: '4194304', changed: false, valueType: 'numeric' },
      { key: 'ob_compatibility_mode', value: 'MYSQL', changed: false },
      { key: 'ob_max_parallel_degree', value: '32', changed: false },
      { key: 'ob_query_timeout', value: '10000000', changed: false },
      { key: 'ob_read_consistency', value: 'STRONG', changed: false },
      { key: 'ob_route_policy', value: 'READONLY_ZONE_FIRST', changed: false },
      { key: 'ob_trx_timeout', value: '100000000', changed: false },
      { key: 'tx_isolation', value: 'READ-COMMITTED', changed: false },
      { key: 'auto_increment_cache_size', value: '1000000', changed: false },
      { key: 'auto_increment_increment', value: '1', changed: false },
      { key: 'auto_increment_offset', value: '1', changed: false },
      { key: 'binlog_row_image', value: 'FULL', changed: false },
      { key: 'character_set_client', value: 'utf8mb4', changed: false },
      { key: 'character_set_connection', value: 'utf8mb4', changed: false },
      { key: 'character_set_database', value: 'utf8mb4', changed: false },
      { key: 'character_set_filesystem', value: 'binary', changed: false },
      { key: 'character_set_results', value: '', changed: false },
      { key: 'character_set_server', value: 'utf8mb4', changed: false },
      { key: 'character_set_system', value: 'utf8mb4', changed: false },
      { key: 'collation_connection', value: 'utf8mb4_general_ci', changed: false },
      { key: 'collation_database', value: 'utf8mb4_general_ci', changed: false },
      { key: 'collation_server', value: 'utf8mb4_general_ci', changed: false },
      { key: 'datadir', value: '/usr/local/mysql/data/', changed: false },
      { key: 'div_precision_increment', value: '4', changed: false },
      { key: 'error_on_overlap_time', value: 'OFF', changed: false },
      { key: 'explicit_defaults_for_timestamp', value: 'ON', changed: false },
      { key: 'foreign_key_checks', value: 'ON', changed: false },
      { key: 'group_concat_max_len', value: '1024', changed: false },
      { key: 'identity', value: '0', changed: false },
      { key: 'init_connect', value: '', changed: false },
      { key: 'is_result_accurate', value: 'ON', changed: false },
      { key: 'license', value: '', changed: false },
      { key: 'lower_case_table_names', value: '1', changed: false },
      { key: 'max_user_connections', value: '0', changed: false },
      { key: 'net_buffer_length', value: '16384', changed: false },
      { key: 'net_read_timeout', value: '30', changed: false },
      { key: 'net_write_timeout', value: '60', changed: false },
      { key: 'ob_bnl_join_cache_size', value: '10485760', changed: false },
      { key: 'ob_create_table_strict_mode', value: 'ON', changed: false },
      { key: 'ob_default_replica_num', value: '1', changed: false },
      { key: 'ob_enable_aggregation_pushdown', value: 'ON', changed: false },
      { key: 'ob_enable_blk_nestedloop_join', value: 'OFF', changed: false },
      { key: 'ob_enable_hash_group_by', value: 'ON', changed: false },
      { key: 'ob_enable_index_direct_select', value: 'OFF', changed: false },
      { key: 'ob_enable_plan_cache', value: 'ON', changed: false },
      { key: 'ob_enable_trace_log', value: 'OFF', changed: false },
      { key: 'ob_enable_transformation', value: 'ON', changed: false },
      { key: 'ob_enable_transmission_checksum', value: 'ON', changed: false },
      { key: 'ob_enable_truncate_flashback', value: 'ON', changed: false },
      { key: 'ob_interm_result_mem_limit', value: '2147483648', changed: false },
      { key: 'ob_last_schema_version', value: '0', changed: false },
      { key: 'ob_log_level', value: 'disabled', changed: false },
      { key: 'ob_org_cluster_id', value: '0', changed: false },
      { key: 'ob_plan_cache_evict_high_percentage', value: '90', changed: false },
      { key: 'ob_plan_cache_evict_low_percentage', value: '50', changed: false },
      { key: 'ob_plan_cache_percentage', value: '5', changed: false },
      { key: 'ob_sql_work_area_percentage', value: '5', changed: false },
      { key: 'ob_stmt_parallel_degree', value: '1', changed: false },
      { key: 'ob_tcp_invited_nodes', value: '%', changed: false },
      { key: 'query_cache_size', value: '1048576', changed: false },
      { key: 'query_cache_type', value: 'OFF', changed: false },
      { key: 'read_only', value: 'OFF', changed: false },
      { key: 'recyclebin', value: 'ON', changed: false },
      { key: 'sql_auto_is_null', value: 'OFF', changed: false },
      { key: 'sql_mode', value: 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES', changed: false },
      { key: 'sql_quote_show_create', value: 'ON', changed: false },
      { key: 'sql_select_limit', value: '9223372036854775807', changed: false },
      { key: 'sql_throttle_cpu', value: '-1', changed: false },
      { key: 'sql_throttle_current_priority', value: '100', changed: false },
      { key: 'sql_throttle_io', value: '-1', changed: false },
      { key: 'sql_throttle_logical_reads', value: '-1', changed: false },
      { key: 'sql_throttle_network', value: '-1', changed: false },
      { key: 'sql_throttle_priority', value: '-1', changed: false },
      { key: 'sql_throttle_rt', value: '-1', changed: false },
      { key: 'sql_warnings', value: 'OFF', changed: false },
      { key: 'system_time_zone', value: 'CST', changed: false },
      { key: 'timestamp', value: '0', changed: false },
      { key: 'time_zone', value: '+8:00', changed: false },
      { key: 'tx_read_only', value: 'OFF', changed: false },
      { key: 'version', value: '1.4.76', changed: false },
      {
        key: 'version_comment',
        value:
          'OceanBase 1.4.76 (r1797812-ff6c79e33cb792fa83868ee177929c3e2bfe22a8) (Built Jun 13 2019 20:22:49)',
        changed: false,
      },
      { key: 'wait_timeout', value: '28800', changed: false },
    ],
  },
  // 获取 DML
  'PATCH /api/v1/variables/getUpdateSql/:sid': {
    data: {
      beforeResource: {},
      resource: {},
      sid: 'string',
      sql: 'string',
      userId: 'string',
    },
  },
  // 执行 DML
  'PATCH /api/v1/variables/execute/:sid': {
    data: {},
  },
};
