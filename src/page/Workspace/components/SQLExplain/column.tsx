import { formatMessage } from '@/util/intl';
import { Button } from 'antd';
import { FormattedMessage } from '@umijs/max';

export const getSqlExplainColumns = ({ handleShowOutputFilter }) => {
  return [
    {
      dataIndex: 'operator',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.operator',
      }), // width: 530,
    },
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.name',
      }),
      width: 126,
      fixed: 'right',
      render: (v) => {
        return (
          <div
            style={{
              maxWidth: 110,
              display: 'flex',
              alignItems: 'center',
            }}
            title={v}
          >
            <span
              style={{
                flex: 1,
                display: 'inline-block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {v}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'rowCount',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.rows',
      }),
      width: 86,
      fixed: 'right',
    },
    {
      dataIndex: 'cost',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.cost',
      }),
      width: 86,
      fixed: 'right',
    },
    {
      dataIndex: 'outputFilter',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.output',
      }),
      width: 366,
      fixed: 'right',
      render: (v: string) => (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: 350,
            }}
          >
            <span
              style={{
                flex: 1,
                display: 'inline-block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {v}
            </span>
            <Button
              style={{
                fontSize: 12,
              }}
              type="link"
              size="small"
              onClick={() => handleShowOutputFilter(v)}
            >
              <FormattedMessage id="workspace.window.sql.explain.button.showOutputFilter" />
            </Button>
          </div>
        </>
      ),
    },
  ];
};
