import { useControllableValue } from 'ahooks';
import { Select, Tag } from 'antd';
import React, { useMemo } from 'react';
import { KEY_CODE_MAP, getKeyCodeText } from './keycodemap';
import { KeyCode, KeyMod } from 'monaco-editor';
import { BaseSelectRef, CustomTagProps } from 'rc-select/lib/BaseSelect';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  onChange?: (value: string) => void;
}

const KeymapInput: React.FC<IProps> = (props) => {
  const [value, setValue] = useControllableValue(props, {
    defaultValue: '',
  });
  const selectRef = React.useRef<BaseSelectRef>(null);

  const displayValue = useMemo(() => {
    return getKeyCodeText(value);
  }, [value]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { keyCode, metaKey, ctrlKey, shiftKey, altKey } = e;
    e.preventDefault();
    e.stopPropagation();
    if (keyCode === 8) {
      // del
      setValue('');
      return;
    }
    const monacoKeyCode = KEY_CODE_MAP[keyCode];
    let mod = [];
    metaKey && mod.push(KeyCode.Meta);
    ctrlKey && mod.push(KeyCode.Ctrl);
    shiftKey && mod.push(KeyCode.Shift);
    altKey && mod.push(KeyCode.Alt);
    let isSpecialKey = [
      KeyCode.Ctrl,
      KeyCode.Shift,
      KeyCode.Alt,
      KeyCode.Meta,
      KeyCode.Meta,
    ].includes(monacoKeyCode);
    const value = isSpecialKey ? [...mod] : [...mod, monacoKeyCode];
    setValue(value.join(','));
  }

  function tagRender(props: CustomTagProps) {
    const { value, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={false}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {value}
      </Tag>
    );
  }
  return (
    <Select
      ref={selectRef}
      mode="multiple"
      value={displayValue}
      allowClear
      onClear={() => {
        setValue('');
      }}
      options={[]}
      onKeyDown={onKeyDown}
      tagRender={tagRender}
      open={false}
      showArrow
      style={props.style}
      className={props.className}
      suffixIcon={
        <PlusOutlined
          onClick={function () {
            selectRef.current.focus();
          }}
        />
      }
    />
  );
};

export default KeymapInput;
