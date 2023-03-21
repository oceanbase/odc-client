import moment from 'moment';
import { addComment, getPLScriptTemplate, removeComment, removeTableQuote } from '../sql';

describe('test sql utils', () => {
  it('addComment', () => {
    const date = moment(new Date()).format('YYYY/MM/DD');
    expect(
      addComment(['select * from test;', 'select * from test2;'].join('\n'), 'userName'),
    ).toEqual(
      `/* comment added by userName ${date}\n* select * from test;\n* select * from test2;\n*/`,
    );
    expect(
      addComment(['select * from test;', 'select * from test2;', ''].join('\n'), 'userName'),
    ).toEqual(
      `/* comment added by userName ${date}\n* select * from test;\n* select * from test2;\n*/\n`,
    );
    expect(addComment('', 'userName')).toEqual('');
  });
  it('removeComment', () => {
    expect(
      removeComment(
        `/* comment added by userName ${1}\n* select * from test;\n* select * from test2;\n*/`,
      ),
    ).toEqual(['select * from test;', 'select * from test2;'].join('\n'));
    expect(removeComment(`/*select * from test;\n* select * from test2;\n*/`)).toEqual(
      ['select * from test;', 'select * from test2;'].join('\n'),
    );
  });
  it('getPLScriptTemplate', () => {
    expect(getPLScriptTemplate()).toEqual(
      [
        'DECLARE',
        '  -- Local variables here',
        '  i NUMBER;',
        'BEGIN',
        '  -- Test statements here',
        "  dbms_output.put_line('Hello World!');",
        'END;',
      ].join('\n'),
    );
  });
  it('removeTableQuote', () => {
    expect(removeTableQuote('"table"')).toEqual('table');
    expect(removeTableQuote('table')).toEqual('table');
    expect(removeTableQuote(' ')).toEqual('');
  });
});
