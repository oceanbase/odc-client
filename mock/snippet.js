export default {
  // 查询代码片段列表
  'GET /api/v1/snippets/list/:userId': {
    data: [
      {
        prefix: 'AAACCC',
        description: `CASE name
				WHEN 'Steven' THEN 'No.1'
				WHEN 'Tom' THEN 'No.2'
				ELSE 'others'
        END;`,
        id: 123,
        body: `CASE case_value \${1:tableName} \${1:aaa} \${1:ccc}
				WHEN when_value THEN statement_list
				ELSE statement_list
			END;CASE case_value
      WHEN when_value THEN statement_list
      ELSE statement_list
    END;CASE case_value
    WHEN when_value THEN statement_list
    ELSE statement_list
  END;`,
        type: 'DML',
      },
    ],
  },
  // 新增代码片段
  'POST /api/v1/snippets/:userId': {
    data: true,
  },
  // 删除代码片段
  'DELETE /api/v1/snippets/:id': {
    data: true,
  },
  // 更新代码片段
  'PUT /api/v1/snippets/:id': {
    data: true,
  },
};
