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
