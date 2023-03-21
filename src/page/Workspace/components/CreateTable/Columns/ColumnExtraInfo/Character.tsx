import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { Col, Form, Row, Select } from 'antd';
import { isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import { useContext } from 'react';
import TablePageContext from '../../../TablePage/context';
import { getDefaultCollation } from '../../helper';
import { TableColumn } from '../../interface';

const Option = Select.Option;

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
  schemaStore?: SchemaStore;
}

export default inject('schemaStore')(
  observer(function ({ column, onChange, schemaStore }: IProps) {
    const { collations, charsets } = schemaStore;
    const { character, collation, ordinalPosition } = column;
    const pageContext = useContext(TablePageContext);
    const configValue = [];
    if (column.unsigned) {
      configValue.push('unsigned');
    }
    if (column.zerofill) {
      configValue.push('zerofill');
    }
    return (
      <Form layout="vertical">
        <Row gutter={32} style={{ width: 350 }}>
          <Col span={12}>
            <Form.Item
              label={formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Character.CharacterSet',
              })} /*字符集*/
            >
              <Select
                disabled={pageContext?.editMode && !isNil(ordinalPosition)}
                value={character}
                onChange={(v) => {
                  onChange({
                    ...column,
                    character: v,
                    collation: getDefaultCollation(v, collations),
                  });
                }}
              >
                {charsets?.map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Character.SortingRules',
              })} /*排序规则*/
            >
              <Select
                disabled={pageContext?.editMode && !isNil(ordinalPosition)}
                value={collation}
                onChange={(v) => {
                  onChange({
                    ...column,
                    collation: v,
                  });
                }}
              >
                {collations
                  ?.filter((c) => {
                    let _character = character || '';
                    return c.indexOf(_character) > -1;
                  })
                  .map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }),
);
