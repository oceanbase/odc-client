import { formatMessage } from '@/util/intl';
import { Col, Form, Row, Select } from 'antd';
import { isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import { useContext } from 'react';
import TablePageContext from '../../../TablePage/context';
import { getDefaultCollation } from '../../helper';

const Option = Select.Option;

export default inject('schemaStore')(
  observer(function ({ column, onChange, schemaStore }: any) {
    const configValue = [];
    const { character, collation, enumMembers, ordinalPosition } = column;
    const { collations, charsets } = schemaStore;
    const pageContext = useContext(TablePageContext);
    if (column.unsigned) {
      configValue.push('unsigned');
    }
    if (column.zerofill) {
      configValue.push('zerofill');
    }
    return (
      <Form layout="vertical">
        <Form.Item
          label={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Enum.EnumeratedValues',
          })}
          /*枚举值*/ extra={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Enum.EnterTheEnumerationValueAnd',
          })} /*录入枚举值按“回车 enter”确认*/
        >
          <Select
            style={{ width: 350 }}
            value={enumMembers}
            mode="tags"
            tokenSeparators={[',']}
            onChange={(v) => {
              onChange({
                ...column,
                enumMembers: v,
              });
            }}
          />
        </Form.Item>
        <Row gutter={32} style={{ width: 350 }}>
          <Col span={12}>
            <Form.Item
              label={formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Enum.CharacterSet',
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
                id: 'odc.Columns.ColumnExtraInfo.Enum.SortingRules',
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
