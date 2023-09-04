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

import { formatMessage } from '@/util/intl';
import { parser, getOBUser } from '@/util/dataSourceParser';
import { LoadingOutlined } from '@ant-design/icons';
import { Form, Input, Spin } from 'antd';
import React, { useCallback, useContext, useState } from 'react';

import { testConnection } from '@/common/network/connection';
import { AccountType } from '@/d.ts';
import classNames from 'classnames';
import { trim } from 'lodash';
import DatasourceFormContext from './context';
import styles from './index.less';

interface IProps {
  autoType: boolean;
}

const ParseURLItem: React.FC<IProps> = function (props) {
  const { autoType } = props;
  const [parserUrl, setParserUrl] = useState('');
  const [isparsing, setIsparsing] = useState(false);
  const formContext = useContext(DatasourceFormContext);

  const autoParse = useCallback(async () => {
    if (!parserUrl) {
      return;
    }

    if (parserUrl) {
      setIsparsing(true);
      try {
        const data = parser.parse(trim(parserUrl, ' \t\n'));
        if (data) {
          let newData = { ...data };
          if (newData?.user) {
            const user = getOBUser(newData?.user);
            newData = {
              ...newData,
              ...user,
            };
            delete newData.user;
          }
          Object.keys(newData).forEach((key) => {
            if (newData[key] == null) {
              delete newData[key];
            }
          });
          const { clusterName, tenantName, host, port, username, password } = newData;
          if (autoType && tenantName && host && port && username && password) {
            /**
             * 具备测试连接的必要条件，去主动获取一下数据库类型
             */
            const res = await testConnection(
              {
                clusterName,
                tenantName,
                host,
                port,
                username,
                password,
                sslConfig: {
                  enabled: false,
                },
              },
              AccountType.MAIN,
              true,
            );
            if (res?.data?.type) {
              newData.type = res?.data?.type;
            }
          }
          newData = {
            password: '',
            clusterName: '',
            ...newData,
          };
          formContext.form?.setFieldsValue(newData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsparsing(false);
      }
    }
  }, [parserUrl]);

  return (
    <Form.Item
      label={formatMessage({
        id: 'odc.AddConnectionDrawer.AddConnectionForm.IntelligentResolution',
      })}
    >
      <Input.TextArea
        placeholder={formatMessage({
          id: 'odc.AddConnectionDrawer.AddConnectionForm.PasteTheConnectionStringInformation',
        })}
        style={{
          width: '100%',
        }}
        autoSize={{
          minRows: 4,
          maxRows: 4,
        }}
        value={parserUrl}
        onChange={(e) => {
          setParserUrl(e.target.value);
        }}
      />
      <div className={styles.parserActions}>
        {isparsing ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
        ) : (
          <a
            onClick={autoParse}
            className={classNames(parserUrl ? styles.parserUrl : styles.parserUrlDisabled)}
          >
            {formatMessage({
              id: 'odc.AddConnectionDrawer.AddConnectionForm.IntelligentResolution',
            })}
          </a>
        )}
      </div>
    </Form.Item>
  );
};

export default ParseURLItem;
