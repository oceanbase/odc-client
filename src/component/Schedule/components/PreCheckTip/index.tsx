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
  const total = errorList?.length + warningList?.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Popover
        content={
          <div>
            {errorList?.length ? <h4>{`存在${errorList?.length}项错误`}</h4> : undefined}
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
              <h4 style={{ marginTop: '12px' }}>{`存在${warningList?.length}项警告`}</h4>
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
          <span>{`检查完成：存在 ${warningList?.length} 项警告，${errorList?.length} 项错误。`}</span>
        )}
      </Popover>
    </div>
  );
};

export default PreCheckTip;
