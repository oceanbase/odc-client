import { Dropdown } from 'antd';
import { DropDownProps } from 'antd/lib/dropdown';
import React from 'react';
import HeaderBtn from '../HeaderBtn';

interface IProps {
  overlay: React.ReactElement;
  placement?: DropDownProps['placement'];
  className?: string;
}

class DropdownMenu extends React.PureComponent<IProps> {
  public menuRef: React.RefObject<HTMLSpanElement> = React.createRef();

  render() {
    const { overlay, children, className } = this.props;
    return (
      <Dropdown overlay={overlay} getPopupContainer={() => this.menuRef?.current}>
        <HeaderBtn ref={this.menuRef} className={className}>
          {children}
        </HeaderBtn>
      </Dropdown>
    );
  }
}

export default DropdownMenu;
