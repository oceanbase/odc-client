import { formatMessage } from '@/util/intl';
import { getDataSourceModeConfig } from '@/common/datasource';
import { ConnectType, DbObjectType } from '@/d.ts';
import { Col, Form, Row, Select } from 'antd';
export default function ExtraOptions({
  dbType,
  connectType,
}: {
  connectType: ConnectType;
  dbType: DbObjectType;
}) {
  const config =
    dbType === DbObjectType.function
      ? getDataSourceModeConfig(connectType)?.schema?.func
      : getDataSourceModeConfig(connectType)?.schema?.proc;
  return (
    <>
      <Row gutter={12}>
        {config?.deterministic ? (
          <Col span={8}>
            <Form.Item
              label={
                formatMessage({ id: 'odc.src.component.ProcedureParam.Decisive' }) /* 决定性 */
              }
              name={['characteristic', 'deterministic']}
            >
              <Select
                style={{
                  width: '100%',
                }}
              >
                <Select.Option value={true}>DETERMINISTIC</Select.Option>
                <Select.Option value={false}>NOT DETERMINISTIC</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        ) : null}
        {config?.dataNature ? (
          <Col span={8}>
            <Form.Item
              label={
                formatMessage({ id: 'odc.src.component.ProcedureParam.DataOption' }) /* 数据选项 */
              }
              name={['characteristic', 'dataNature']}
            >
              <Select
                style={{
                  width: '100%',
                }}
              >
                <Select.Option value={'CONTAINS SQL'}>CONTAINS SQL</Select.Option>
                <Select.Option value={'NO SQL'}>NO SQL</Select.Option>
                <Select.Option value={'READS SQL'}>READS SQL</Select.Option>
                <Select.Option value={'MODIFIES SQL'}>MODIFIES SQL</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        ) : null}
        {config?.sqlSecurity ? (
          <Col span={8}>
            <Form.Item
              label={
                formatMessage({
                  id: 'odc.src.component.ProcedureParam.SQLSecurity',
                }) /* SQL 安全性 */
              }
              name={['characteristic', 'sqlSecurity']}
            >
              <Select
                style={{
                  width: '100%',
                }}
              >
                <Select.Option value={'INVOKER'}>INVOKER</Select.Option>
                <Select.Option value={'DEFINER'}>DEFINER</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        ) : null}
      </Row>
    </>
  );
}
