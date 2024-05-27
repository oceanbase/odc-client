import { Button, Form, Select, Space, Input } from 'antd';
import styles from './index.less';
import classNames from 'classnames';

const { TextArea } = Input;

export const PartitionTextArea = ({ name, fieldKey, value, ...restTextAreaProps }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className={classNames([styles.inputLabel])}>分区</div>
      <Form.Item
        name={name}
        fieldKey={fieldKey}
        style={{
          flexGrow: 2,
        }}
      >
        <TextArea
          {...restTextAreaProps}
          autoSize={{ maxRows: 3 }}
          placeholder={'请输入分区名称，多个分区间用英文逗号隔开'}
        />
      </Form.Item>
    </div>
  );
};
