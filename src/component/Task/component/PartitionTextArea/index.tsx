import { formatMessage } from '@/util/intl';
import { Button, Form, Select, Space, Input } from 'antd';
import styles from './index.less';
import classNames from 'classnames';

const { TextArea } = Input;

export const PartitionTextArea = ({ name, fieldKey, value, ...restTextAreaProps }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className={classNames([styles.inputLabel])}>
        {formatMessage({
          id: 'src.component.Task.component.PartitionTextArea.506043A9',
          defaultMessage: '分区',
        })}
      </div>
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
          placeholder={formatMessage({
            id: 'src.component.Task.component.PartitionTextArea.51B4FB10',
            defaultMessage: '请输入分区名称，多个分区间用英文逗号隔开',
          })}
        />
      </Form.Item>
    </div>
  );
};
