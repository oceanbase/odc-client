import { ConnectionStore } from '@/store/connection';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { SettingOutlined } from '@ant-design/icons';
import { Popover, Row, Switch, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useState } from 'react';
import DelimiterSelect from '../DelimiterSelect';
import InputBigNumber from '../InputBigNumber';

import SessionParamDrawer from '@/page/Workspace/components/SessionParamPage/SessionParamDrawer';
import styles from './index.less';
import SQLConfigContext from './SQLConfigContext';

interface IProps {
  connectionStore?: ConnectionStore;
  isShowText?: boolean;
  settingStore?: SettingStore;
}

const SQLConfig: React.FC<IProps> = function (props) {
  const { session, pageKey } = useContext(SQLConfigContext);
  const [queryLimitValue, setQueryLimitValue] = useState(1);
  const [showSessionParam, setShowSessionParam] = useState(false);
  const [tableColumnInfoVisibleValue, setTableColumnInfoVisibleValue] = useState(true);
  const [visible, setVisible] = useState(false);
  const queryLimit = session?.queryLimit;
  const tableColumnInfoVisible = session?.tableColumnInfoVisible;

  useEffect(() => {
    setQueryLimitValue(session?.queryLimit);
  }, [queryLimit]);

  useEffect(() => {
    setTableColumnInfoVisibleValue(tableColumnInfoVisible);
  }, [tableColumnInfoVisible]);

  const handleSetQueryLimit = async () => {
    const success = await props.connectionStore.setQueryLimit(queryLimitValue, pageKey);
    if (!success) {
      setQueryLimitValue(queryLimit);
    }
  };

  const handleColumnInfoVisibleChange = (value: boolean) => {
    props.connectionStore.changeColumnInfoVisible(value, pageKey);
  };

  function renderContent() {
    return (
      <Row>
        <Row
          style={{
            lineHeight: '28px',
            width: '100%',
          }}
        >
          Delimiter
        </Row>
        <Row style={{ width: '100%' }}>
          <DelimiterSelect />
        </Row>
        <Row
          style={{
            lineHeight: '28px',
            marginTop: 12,
          }}
        >
          {
            formatMessage({
              id: 'odc.component.SQLConfig.QueryResultLimits',
            })
            /*查询结果限制*/
          }
        </Row>
        <Row>
          <InputBigNumber
            value={queryLimitValue}
            min="1"
            max={props.settingStore.maxResultSetRows + ''}
            style={{
              width: '100%',
            }}
            placeholder={formatMessage({
              id: 'odc.component.SQLConfig.Unlimited',
            })}
            /*无限制*/
            onChange={(v) => {
              if (!v) {
                /**
                 * 判断是否允许无限制，假如不允许，禁止删除
                 */
                const max = props.settingStore.maxResultSetRows;
                if (max !== Number.MAX_SAFE_INTEGER) {
                  setQueryLimitValue(1);
                  return;
                }
              }
              setQueryLimitValue(parseInt(v) || undefined);
            }}
            onBlur={handleSetQueryLimit}
          />

          {!queryLimitValue && (
            <div
              style={{
                lineHeight: '28px',
                color: '#faad14',
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.SQLConfig.UnlimitedSystemInstability',
                })

                /*无限制易导致系统不稳定*/
              }
            </div>
          )}
        </Row>
        <Row
          style={{
            lineHeight: '28px',
            marginTop: 12,
          }}
        >
          {
            formatMessage({
              id: 'odc.component.SQLConfig.ObtainTheColumnInformationOf',
            }) /*获取结果集列信息*/
          }
        </Row>
        <Row style={{ width: '100%' }}>
          <Tooltip
            title={formatMessage({
              id: 'odc.component.SQLConfig.AfterClosingColumnCommentsAnd',
            })} /*关闭后将不查询获取列注释及可编辑的列信息，可降低 DB 耗时*/
          >
            <Switch
              checked={tableColumnInfoVisibleValue}
              onChange={handleColumnInfoVisibleChange}
            />
          </Tooltip>
        </Row>
        <Row
          style={{
            marginTop: 18,
            width: '100%',
          }}
        >
          <a
            onClick={() => {
              setShowSessionParam(true);
              setVisible(false);
            }}
          >
            {
              formatMessage({
                id: 'odc.component.SQLConfig.SetSessionVariables',
              }) //设置会话变量 >
            }
          </a>
        </Row>
      </Row>
    );
  }
  return (
    <>
      <Popover
        overlayStyle={{
          width: 170,
        }}
        placement="bottom"
        title=""
        content={renderContent()}
        visible={visible}
        onVisibleChange={(v) => {
          setVisible(v);
        }}
      >
        <span
          className={styles.sqlconfig}
          style={{
            color: 'var(--text-color-primary)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <SettingOutlined style={{ fontSize: 14, height: 14, overflow: 'hidden' }} />
          {props.isShowText ? (
            <span style={{ whiteSpace: 'nowrap', marginLeft: 5, lineHeight: 1 }}>
              {formatMessage({ id: 'odc.component.SQLConfig.Set' }) /*设置*/}
            </span>
          ) : null}
        </span>
      </Popover>
      <SessionParamDrawer
        sessionId={session?.sessionId}
        visible={showSessionParam}
        onClose={() => {
          setShowSessionParam(false);
        }}
      />
    </>
  );
};

export default inject('connectionStore', 'settingStore')(observer(SQLConfig));
