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
import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  const [queryLimitValue, setQueryLimitValue] = useState(
    Number(setting.spaceConfigurations?.['odc.sqlexecute.default.queryLimit']),
  );
  const [showSessionParam, setShowSessionParam] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showMaxLimit, setShowMaxLimit] = useState(false);
  const queryLimit = session?.params?.queryLimit;
  const tableColumnInfoVisible = session?.params.tableColumnInfoVisible;
  const fullLinkTraceEnabled = session?.params.fullLinkTraceEnabled;
  const continueExecutionOnError = session?.params.continueExecutionOnError;

  useEffect(() => {
    setting.getUserConfig();
  }, []);

  useEffect(() => {
    setQueryLimitValue(session?.params.queryLimit);
  }, [queryLimit]);

  const handleSetQueryLimit = async (e) => {
    /**
     * 判断是否允许无限制，假如不允许，禁止删除
     */
    const maxQueryLimit = session?.params?.maxQueryLimit;
    if (maxQueryLimit !== Number.MAX_SAFE_INTEGER && !queryLimitValue) {
      setQueryLimitValue(session?.params.queryLimit);
      return;
    }
    if (e.target.value > maxQueryLimit) {
      setShowMaxLimit(true);
    } else {
      setShowMaxLimit(false);
      await session.setQueryLimit(queryLimitValue);
    }
  };

  const handleColumnInfoVisibleChange = (value: boolean) => {
    session.changeColumnInfoVisible(value);
  };

  function renderContent() {
    return (
      <Row>
        <h4>
          {formatMessage({ id: 'src.component.SQLConfig.1A5CCA98', defaultMessage: 'SQL 执行' })}
        </h4>
        <div className={styles.sqlconfigGroup}>
          <Row
            style={{
              lineHeight: '28px',
              width: '100%',
            }}
          >
            {formatMessage({
              id: 'src.component.SQLConfig.1D15916D',
              defaultMessage: 'Delimiter 设置',
            })}
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
                id: 'src.component.SQLConfig.2F1AC452' /*报错继续执行*/,
                defaultMessage: '报错继续执行',
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
        </div>
        <h4>
          {formatMessage({ id: 'src.component.SQLConfig.27EDBEAB', defaultMessage: '查询结果' })}
        </h4>
        <div className={styles.sqlconfigGroup}>
          <Row
            style={{
              lineHeight: '28px',
            }}
          >
            {
              formatMessage({
                id: 'odc.component.SQLConfig.QueryResultLimits',
                defaultMessage: '查询结果限制',
              })
              /*查询结果限制*/
            }
          </Row>
          <Row>
            <InputBigNumber
              value={queryLimitValue}
              min="1"
              style={{
                width: '100%',
              }}
              placeholder={formatMessage({
                id: 'odc.component.SQLConfig.Unlimited',
                defaultMessage: '无限制',
              })}
              /*无限制*/
              onChange={(v) => {
                setQueryLimitValue(parseInt(v) || undefined);
              }}
              onBlur={handleSetQueryLimit}
            />

            {showMaxLimit && (
              <div
                style={{
                  lineHeight: '28px',
                  color: '#ff4d4f',
                }}
              >
                {formatMessage({
                  id: 'src.component.SQLConfig.5E06ED93',
                  defaultMessage: '不超过查询条数上限',
                })}

                {session?.params.maxQueryLimit || '-'}
              </div>
            )}

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
                    defaultMessage: '无限制易导致系统不稳定',
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
                defaultMessage: '获取结果集列信息',
              }) /*获取结果集列信息*/
            }
          </Row>
          <Row style={{ width: '100%' }}>
            <Tooltip
              title={formatMessage({
                id: 'odc.component.SQLConfig.AfterClosingColumnCommentsAnd',
                defaultMessage: '关闭后将不查询获取列注释及可编辑的列信息，可降低 DB 耗时',
              })} /*关闭后将不查询获取列注释及可编辑的列信息，可降低 DB 耗时*/
            >
              <Switch
                size="small"
                checked={tableColumnInfoVisible}
                onChange={handleColumnInfoVisibleChange}
              />
            </Tooltip>
          </Row>
        </div>
        <Row
          style={{
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
                defaultMessage: '设置会话变量 >',
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
        placement="bottomLeft"
        title=""
        content={session ? renderContent() : null}
        open={visible}
        showArrow={false}
        onOpenChange={(v) => {
          if (v) {
            setting.getSpaceConfig();
          }
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
              {
                formatMessage({
                  id: 'odc.component.SQLConfig.Set',
                  defaultMessage: '设置',
                }) /*设置*/
              }
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
