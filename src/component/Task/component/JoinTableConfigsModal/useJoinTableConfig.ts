import { useState } from 'react';
import { FormInstance } from 'antd';

export default function useJoinTableConfig(form?: FormInstance) {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(null);

  const open = (index: number) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    setCurrentIndex(null);
  };

  const handleSubmit = (values) => {
    form.setFieldsValue({
      tables: form
        .getFieldValue('tables')
        .map((item, i) => (i === currentIndex ? { ...item, ...values } : item)),
    });
    close();
  };

  return {
    visible,
    currentIndex,
    open,
    close,
    handleSubmit,
  };
}
