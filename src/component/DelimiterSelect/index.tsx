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

import { AutoComplete } from 'antd';
import { trim } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import SQLConfigContext from '../SQLConfig/SQLConfigContext';

interface IProps {}

const DelimiterSelect: React.FC<IProps> = function (props) {
  const { session, pageKey } = useContext(SQLConfigContext);
  const [delimiterValue, setDelimiterValue] = useState(null);
  const delimiter = session?.params?.delimiter;

  useEffect(() => {
    setDelimiterValue(delimiter);
  }, [delimiter]);

  return (
    <AutoComplete
      style={{ width: '100%' }}
      key={delimiter}
      value={delimiterValue}
      onChange={(v) => {
        setDelimiterValue(v);
      }}
      onBlur={async () => {
        if (trim(delimiterValue)) {
          const isSuccess = await session.changeDelimiter(delimiterValue);
          if (!isSuccess) {
            setDelimiterValue(delimiter);
          }
        } else {
          setDelimiterValue(delimiter);
        }
      }}
      size="small"
      disabled={session?.params?.delimiterLoading}
      options={[';', '/', '//', '$', '$$'].map((value) => {
        return {
          value,
        };
      })}
    />
  );
};

export default DelimiterSelect;
