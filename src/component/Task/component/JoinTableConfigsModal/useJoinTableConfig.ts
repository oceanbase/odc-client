/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
