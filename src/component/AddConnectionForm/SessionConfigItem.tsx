import Helpdoc from '@/component/helpDoc';
import { formatMessage } from '@/util/intl';
import { Form, InputNumber } from 'antd';
import React from 'react';

interface IProps {
  onlySys: boolean;
}

const SessionConfigItem: React.FC<IProps> = function (props) {
  const { onlySys } = props;
  return (
    <>
      <Form.Item
        required
        label={
          <Helpdoc isTip leftText doc="sessionTimeTip">
            {
              formatMessage({
                id: 'odc.component.AddConnectionForm.SessionConfigItem.SqlQueryTimeout',
              }) /*SQL 查询超时*/
            }
          </Helpdoc>
        }
        name="queryTimeoutSeconds"
        rules={[
          {
            max: 2147484,
            message: formatMessage({
              id: 'odc.AddConnectionDrawer.AddConnectionForm.TheMaximumValueIs',
            }),

            // 超过最大值2147484限制
            type: 'number',
          },
        ]}
      >
        <InputNumber<number | string>
          disabled={onlySys}
          formatter={(value) => {
            return (
              (value || '') +
              formatMessage({
                id: 'odc.AddConnectionDrawer.AddConnectionForm.Seconds',
              })
            );
          }}
          parser={(value) =>
            value.replace(
              formatMessage({
                id: 'odc.AddConnectionDrawer.AddConnectionForm.Seconds',
              }),

              '',
            )
          }
          min={1}
          style={{
            width: 110,
          }}
          placeholder={formatMessage({
            id: 'odc.AddConnectionDrawer.AddConnectionForm.Enter',
          })}
        />
      </Form.Item>
    </>
  );
};

export default SessionConfigItem;
