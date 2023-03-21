import { formatMessage } from '@/util/intl';
import { LoadingOutlined } from '@ant-design/icons';
import { Form, Input, Spin } from 'antd';
import React, { useCallback, useState } from 'react';

import { parseConnectionStr, testConnection } from '@/common/network/connection';
import { AccountType } from '@/d.ts';
import classNames from 'classnames';
import { trim } from 'lodash';
import styles from './index.less';

interface IProps {
  onlySys: boolean;
  autoType: boolean;
  handleChangeFormData: (values: Record<string, any>) => void;
}

const ParseURLItem: React.FC<IProps> = function (props) {
  const { onlySys, autoType, handleChangeFormData } = props;
  const [parserUrl, setParserUrl] = useState('');
  const [isparsing, setIsparsing] = useState(false);

  const autoParse = useCallback(async () => {
    if (!parserUrl) {
      return;
    }

    if (parserUrl) {
      setIsparsing(true);
      try {
        const data = await parseConnectionStr(trim(parserUrl, ' \t\n'));
        if (data) {
          let newData = { ...data };
          Object.keys(newData).forEach((key) => {
            if (newData[key] == null) {
              delete newData[key];
            }
          });
          const {
            clusterName,
            tenantName,
            host,
            port,
            defaultSchema,
            username,
            password,
            dialectType,
          } = newData;
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
                defaultSchema,
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

          handleChangeFormData(newData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsparsing(false);
      }
    }
  }, [parserUrl, handleChangeFormData]);

  return (
    <Form.Item
      label={formatMessage({
        id: 'odc.AddConnectionDrawer.AddConnectionForm.IntelligentResolution',
      })}
    >
      <Input.TextArea
        disabled={onlySys}
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
