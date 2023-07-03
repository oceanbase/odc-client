import { Tooltip } from 'antd';

const TooltipContent: React.FC<{ content: string; maxWdith?: number }> = ({
  content,
  maxWdith = 80,
}) => {
  return (
    <Tooltip title={content} placement="top" arrowPointAtCenter>
      <span
        style={{
          maxWidth: `${maxWdith}px`,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {content}
      </span>
    </Tooltip>
  );
};

export default TooltipContent;
