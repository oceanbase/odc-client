import { Popconfirm } from 'antd';
import Action from '@/component/Action';
import { IOperation } from '@/d.ts/operation';

export const renderTool = (tool: IOperation, index) => {
  if (tool.hasOwnProperty('visible') && !tool?.visible) return null;
  if (tool?.confirmText) {
    return (
      <Popconfirm key={tool?.key || index} title={tool?.confirmText} onConfirm={tool?.action}>
        <Action.Link
          key={tool?.key || index}
          disabled={tool?.disable}
          tooltip={tool?.disableTooltip()}
        >
          {tool?.text}
        </Action.Link>
      </Popconfirm>
    );
  }
  return (
    <Action.Link
      key={tool?.key || index}
      disabled={tool?.disable}
      tooltip={tool?.disableTooltip()}
      onClick={tool?.action}
    >
      <span style={{ whiteSpace: 'nowrap' }}>{tool?.text}</span>
    </Action.Link>
  );
};
