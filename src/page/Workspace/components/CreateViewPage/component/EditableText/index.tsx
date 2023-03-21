import { Input } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  editable?: boolean;
  placeholder?: string;
  hideArrow?: boolean;
  initValue?: string;
  onChange: (values: any) => void;
}

interface IState {
  editable: boolean;
  value: string;
}

export default class EditableText extends PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      editable: this.props.editable || false,
      value: this.props.initValue,
    };
  }

  changeToEditable = () => {
    this.setState({
      editable: true,
    });
  };

  handleSubmit = () => {
    const { editable, value } = this.state;
    if (editable) {
      this.setState({
        editable: false,
      });
      this.props?.onChange(value);
    }
  };

  handleChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const { placeholder, hideArrow } = this.props;
    const { editable, value } = this.state;
    if (!editable) {
      if (hideArrow) {
        return <a onClick={this.changeToEditable}>{value || placeholder}</a>;
      } else {
        return <a onClick={this.changeToEditable}>&lt;{value || placeholder}&gt;</a>;
      }
    }
    return (
      <Input
        autoFocus={true}
        size="small"
        style={{ minWidth: '50px' }}
        placeholder={placeholder}
        onBlur={this.handleSubmit}
        onPressEnter={this.handleSubmit}
        onChange={this.handleChange}
        value={value}
      />
    );
  }
}
