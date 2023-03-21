import { Popover } from 'antd';

export default function AntdEditorWrap(props) {
  return (
    <Popover
      overlayClassName="rdg-antd-editor"
      placement={'bottomLeft'}
      visible={true}
      content={props.children}
      getPopupContainer={(triggerNode) => {
        return (
          triggerNode.closest('.rdg')?.parentElement.querySelector('.rdg-editor-archor') ||
          triggerNode
        );
      }}
    >
      <div className="rdg-antd-anchor" />
    </Popover>
  );
}
