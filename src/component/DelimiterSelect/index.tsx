import { ConnectionStore } from '@/store/connection';
import { AutoComplete } from 'antd';
import { trim } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useState } from 'react';
import SQLConfigContext from '../SQLConfig/SQLConfigContext';

interface IProps {
  connectionStore?: ConnectionStore;
}

const DelimiterSelect: React.FC<IProps> = function (props) {
  const { connectionStore } = props;
  const { session, pageKey } = useContext(SQLConfigContext);
  const [delimiterValue, setDelimiterValue] = useState(null);
  const delimiter = session?.delimiter;

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
          const isSuccess = await connectionStore.changeDelimiter(delimiterValue, pageKey);
          if (!isSuccess) {
            setDelimiterValue(delimiter);
          }
        } else {
          setDelimiterValue(delimiter);
        }
      }}
      size="small"
      disabled={session?.delimiterLoading}
      options={[';', '/', '//', '$', '$$'].map((value) => {
        return {
          value,
        };
      })}
    />
  );
};

export default inject('connectionStore')(observer(DelimiterSelect));
