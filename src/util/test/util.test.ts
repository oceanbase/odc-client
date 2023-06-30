import { extractResourceId, getCurrentSQL } from '@/util/utils';
describe('test utils', () => {
  it('A path', () => {
    expect(extractResourceId('sid:test-10086:d:data')).toEqual({
      sid: 'test-10086',
      d: 'data',
    });
  });

  it('getCurrentSql', () => {
    expect(getCurrentSQL('select * from a;', 0, true, ';')).toEqual('select * from a;');
    expect(getCurrentSQL(' select * from a;', 0, true, ';')).toEqual(' select * from a;');
    expect(getCurrentSQL(' select * from a; ', ' select * from a;'.length, true, ';')).toEqual(
      ' select * from a;',
    );
    expect(getCurrentSQL(' select * from a; ', ' select * from a; '.length, true, ';')).toEqual(
      ' select * from a;',
    );
    const multiLineSql = [
      'select * from a;',
      '  -- test a',
      'select * from b;',
      'select * from c;   ',
      '  ',
    ];
    expect(getCurrentSQL(multiLineSql.join('\n'), 0, true, ';')).toEqual('select * from a;');
    expect(getCurrentSQL(multiLineSql.join('\n'), 1, true, ';')).toEqual('select * from a;');
    expect(getCurrentSQL(multiLineSql.join('\n'), multiLineSql[0].length + 1, true, ';')).toEqual(
      '\n' + multiLineSql.slice(1, 3).join('\n'),
    );
    expect(getCurrentSQL(multiLineSql.join('\n'), multiLineSql[0].length + 2, true, ';')).toEqual(
      '\n' + multiLineSql.slice(1, 3).join('\n'),
    );
    expect(
      getCurrentSQL(multiLineSql.join('\n'), multiLineSql.slice(0, 2).join('\n').length, true, ';'),
    ).toEqual('\n' + multiLineSql.slice(1, 3).join('\n'));
    expect(
      getCurrentSQL(multiLineSql.join('\n'), multiLineSql.join('\n').length, true, ';'),
    ).toEqual('\nselect * from c;');
    expect(
      getCurrentSQL(multiLineSql.join('\n'), multiLineSql.join('\n').length - 1, true, ';'),
    ).toEqual('\nselect * from c;');
    expect(
      getCurrentSQL(`select * from a;--asd  `, 'select * from a;--asd'.length, true, ';'),
    ).toEqual('select * from a;');
    expect(
      getCurrentSQL(`select * from a;--asd \n  ;`, 'select * from a;--asd'.length, true, ';'),
    ).toEqual(null);
    expect(
      getCurrentSQL(`select * from a;--asd \n select`, 'select * from a;--asd'.length, true, ';'),
    ).toEqual('--asd \n select');
    expect(
      getCurrentSQL(
        `select * from test where id <> '' ORDER BY id;\nselect * from TEST;`,
        "select * from test where id <> '' ORDER BY id;".length,
        true,
        ';',
      ),
    ).toEqual("select * from test where id <> '' ORDER BY id;");

    expect(
      getCurrentSQL(
        `select * from a where id != '\\';\nselect * from a where id != '';`,
        `select * from a where id != '\\';\nselect * from a where id != '';`.length,
        true,
        ';',
      ),
    ).toEqual("select * from a where id != '\\';\nselect * from a where id != '';");

    expect(
      getCurrentSQL(
        `select * from a where id != '\\';\nselect * from a where id != '';`,
        `select * from a where id != '\\';\nselect * from a where id != '';`.length,
        false,
        ';',
      ),
    ).toEqual("\nselect * from a where id != '';");
    expect(getCurrentSQL(`select * from \`a;--sd\`;`, 1, false, ';')).toEqual('select * from `a;');
    expect(getCurrentSQL(`select * from \`a;--sd\`;`, 1, true, ';')).toEqual(
      'select * from `a;--sd`;',
    );
  });
});
