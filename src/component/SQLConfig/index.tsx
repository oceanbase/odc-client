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

import setting, { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { SettingOutlined } from '@ant-design/icons';
import { Popover, Row, Switch, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useState } from 'react';
import DelimiterSelect from '../DelimiterSelect';
import InputBigNumber from '../InputBigNumber';

import SessionParamDrawer from '@/page/Workspace/components/SessionParamPage/SessionParamDrawer';
import { SessionManagerStore } from '@/store/sessionManager';
import styles from './index.less';
import SQLConfigContext from './SQLConfigContext';

interface IProps {
  sessionManagerStore?: SessionManagerStore;
  isShowText?: boolean;
  settingStore?: SettingStore;
}

const SQLConfig: React.FC<IProps> = function (props) {
  const { session, pageKey } = useContext(SQLConfigContext);
  const [queryLimitValue, setQueryLimitValue] = useState(1);
  const [showSessionParam, setShowSessionParam] = useState(false);
  const [visible, setVisible] = useState(false);
  const queryLimit = session?.params?.queryLimit;
  const tableColumnInfoVisible = session?.params.tableColumnInfoVisible;
  const fullLinkTraceEnabled = session?.params.fullLinkTraceEnabled;
  const continueExecutionOnError = session?.params.continueExecutionOnError;

  useEffect(() => {
    setQueryLimitValue(session?.params.queryLimit);
  }, [queryLimit]);

  const handleSetQueryLimit = async () => {
    const success = await session.setQueryLimit(queryLimitValue);
    if (!success) {
      setQueryLimitValue(queryLimit);
    }
  };

  const handleColumnInfoVisibleChange = (value: boolean) => {
    session.changeColumnInfoVisible(value);
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
              size="small"
              checked={tableColumnInfoVisible}
              onChange={handleColumnInfoVisibleChange}
            />
          </Tooltip>
        </Row>
        <Row
          style={{
            lineHeight: '28px',
            marginTop: 12,
          }}
        >
          {
            formatMessage({
              id: 'src.component.SQLConfig.2F1AC452' /*报错继续执行*/,
            }) /* 报错继续执行 */
          }
        </Row>
        <Row style={{ width: '100%' }}>
          <Switch
            size="small"
            checked={continueExecutionOnError}
            onChange={session?.changeContinueExecutionOnError}
          />
        </Row>
        <Row
          style={{
            lineHeight: '28px',
            marginTop: 12,
          }}
        >
          {
            formatMessage({
              id: 'src.component.SQLConfig.C03B2372' /*开启全链路诊断*/,
            }) /* 开启全链路诊断 */
          }
        </Row>
        <Row style={{ width: '100%' }}>
          <Switch
            size="small"
            checked={fullLinkTraceEnabled}
            onChange={session?.changeFullTraceDiagnosisEnabled}
          />
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
        content={session ? renderContent() : null}
        open={visible}
        showArrow={false}
        onOpenChange={(v) => {
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

export default inject('sessionManagerStore', 'settingStore')(observer(SQLConfig));
