import { Typography } from 'antd';
import type { BaseType } from 'antd/lib/typography/Base';

const ErrorTip: React.FC<{
  errorMessage: string;
}> = ({ errorMessage }) => {
  return (
    !!errorMessage && (
      <div>
        <Typography.Text type="danger">{errorMessage}</Typography.Text>
      </div>
    )
  );
};

export default ErrorTip;
