import { Button, Form, Select, Space, Input } from 'antd';
import styles from './index.less';
import classNames from 'classnames';

const { TextArea } = Input;

export const PartitionTextArea = (props) => {
  return (
    <Form.Item {...props}>
      <div style={{ display: 'flex' }}>
        <div className={classNames([styles.inputLabel, 'ant-input-group-addon'])}>分区</div>
        <TextArea
          autoSize={{ maxRows: 3 }}
          placeholder={'请输入分区名称，多个分区间用英文逗号隔开'}
        />
      </div>
    </Form.Item>
  );
};
