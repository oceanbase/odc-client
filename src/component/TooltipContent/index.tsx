import { Tooltip } from 'antd';

const TooltipContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Tooltip title={content} placement="top" arrowPointAtCenter>
      {content}
    </Tooltip>
  );
};

export default TooltipContent;
