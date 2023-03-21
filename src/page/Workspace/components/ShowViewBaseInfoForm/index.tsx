import { IView } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Input, Select } from 'antd';
import { Component } from 'react';
import styles from './index.less';

enum CheckOption {
  NONE = 'NONE',
}

interface IProps {
  model: Partial<IView>;
}

const { Option } = Select;

class ShowViewBaseInfoForm extends Component<IProps> {
  public render() {
    const { viewName, checkOption, definer } = this.props.model ?? {};
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    const initialValues = {
      viewName: viewName,
      checkOption: checkOption || CheckOption.NONE,
      definer: definer,
    };

    if (!viewName) {
      return null;
    }

    return (
      <Form {...formItemLayout} className={styles.form} initialValues={initialValues}>
        <Form.Item
          name="viewName"
          label={formatMessage({ id: 'workspace.window.createView.viewName' })}
        >
          <Input
            disabled={true}
            placeholder={formatMessage({
              id: 'workspace.window.createView.viewName.placeholder',
            })}
          />
        </Form.Item>
        <Form.Item
          name="checkOption"
          label={formatMessage({
            id: 'workspace.window.createView.checkOption',
          })}
        >
          <Select disabled={true}>
            <Option value={CheckOption.NONE}>{CheckOption.NONE}</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="definer"
          label={formatMessage({ id: 'workspace.window.createView.definer' })}
        >
          <Input disabled={true} />
        </Form.Item>
      </Form>
    );
  }
}

export default ShowViewBaseInfoForm;
