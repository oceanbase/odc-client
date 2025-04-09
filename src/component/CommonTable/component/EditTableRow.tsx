import { Form, GetRef, InputRef, Input, Tooltip } from 'antd';
import React, { useEffect, useRef, useState, useContext } from 'react';
import styles from '../index.less';

type FormInstance<T> = GetRef<typeof Form<T>>;
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}
const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: string;
  record: any;
  handleSave: (record, callback?) => void;
  width?: string;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  width,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    const values = await form.validateFields();
    if (record?.[dataIndex] === values?.[dataIndex]) {
      setEditing(false);
    } else {
      handleSave(values, () => {
        setEditing(false);
      });
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            max: 100,
            message: '备注字符不允许超过100',
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} size="small" />
      </Form.Item>
    ) : (
      <Tooltip title={children} placement="topLeft">
        <div className={styles.editbaleCellValueWarp} style={{ width }} onClick={toggleEdit}>
          {children}
        </div>
      </Tooltip>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export { EditableRow, EditableCell };
