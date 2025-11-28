import { formatMessage } from '@/util/intl';
import { dmlPreCheckResult } from '@/d.ts/schedule';
import { Popover } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface IProps {
  preCheckResult: {
    errorList: dmlPreCheckResult[];
    warningList: dmlPreCheckResult[];
  };
  showTip?: boolean;
}

const PreCheckTip: React.FC<IProps> = (props) => {
  const { preCheckResult, showTip = true } = props;
  const { errorList, warningList } = preCheckResult || {};
  if (errorList?.length === 0 && warningList?.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Popover
        content={
          <div>
            {errorList?.length ? (
              <h4>
                {formatMessage(
                  {
                    id: 'src.component.Schedule.components.PreCheckTip.869EE6D3',
                    defaultMessage: '存在{errorListLength}项错误',
                  },
                  { errorListLength: errorList?.length },
                )}
              </h4>
            ) : undefined}
            {errorList?.map((item, index) => {
              return (
                <div key={index}>
                  <span>{index + 1}</span>
                  <span>.</span>
                  <span>{item?.message}</span>
                </div>
              );
            })}
            {warningList?.length ? (
              <h4 style={{ marginTop: '12px' }}>
                {formatMessage(
                  {
                    id: 'src.component.Schedule.components.PreCheckTip.1A666F41',
                    defaultMessage: '存在{warningListLength}项警告',
                  },
                  { warningListLength: warningList?.length },
                )}
              </h4>
            ) : undefined}
            {warningList?.map((item, index) => {
              return (
                <div key={index}>
                  <span>{index + 1}</span>
                  <span>.</span>
                  <span>{item?.message}</span>
                </div>
              );
            })}
          </div>
        }
      >
        <ExclamationCircleOutlined
          style={{ color: 'var(--icon-orange-color)', marginRight: '4px' }}
        />

        {showTip && (
          <span>
            {formatMessage(
              {
                id: 'src.component.Schedule.components.PreCheckTip.FB794ABD',
                defaultMessage:
                  '检查完成：存在 {warningListLength} 项警告，{errorListLength} 项错误。',
              },
              { warningListLength: warningList?.length, errorListLength: errorList?.length },
            )}
          </span>
        )}
      </Popover>
    </div>
  );
};

export default PreCheckTip;
