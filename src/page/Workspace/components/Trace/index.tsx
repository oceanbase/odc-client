import { formatMessage } from '@/util/intl';
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

import { getFullLinkTraceDownloadUrl } from '@/common/network/sql';
import { TraceSpan } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { downloadFile } from '@/util/data/file';
import { formatTimeTemplatMicroSeconds } from '@/util/data/dateTime';
import { CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Drawer, Input, message, Radio, Row, Tooltip } from 'antd';
import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styles from './index.less';
import TraceComp from './TraceComponent';
export const InfoRender = ({ infos }) => {
  return (
    <Descriptions column={1}>
      {infos.map((info, index) => {
        return (
          <Descriptions.Item key={index} label={info.title}>
            {info.render()}
          </Descriptions.Item>
        );
      })}
    </Descriptions>
  );
};
export enum TraceTabsType {
  Trace = 'Trace',
  List = 'List',
}
export function randomUUID(len = 0, radix = 16) {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = [];
  let i: number;
  const currentRadix = radix || characters.length;
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = characters[0 | (Math.random() * currentRadix)];
  } else {
    let r: number;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = characters[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}
export type ExpandTraceSpan = TraceSpan & {
  isExpand: boolean;
  uuid: string;
  parentChain: string[];
  parentKey: string;
  startTimestamp: number;
  endTimestamp: number;
  isSearch: boolean;
  spanId: string;
  originStartTimestamp: string;
  originEndTimestamp: string;
  level: number;
  title: string;
  isRoot: boolean;
  isParent: boolean;
  index: number;
  siblings: number;
};
const Trace: React.FC<{
  open: boolean;
  setOpen: () => void;
  traceId: string;
  sql: string;
  session: SessionStore;
}> = ({ open, setOpen, traceId, sql, session }) => {
  const [innerTreeData, setInnerTreeData] = useState([]);
  const [tabName, setTabName] = useState<string>(TraceTabsType.Trace);
  const [originStartTimestamp, setOriginStartTimestamp] = useState<string>('');
  const [totalElapseMicroSeconds, setTotalElapseMicroSeconds] = useState<number>();
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>(null);

  const onSearch = (value: string) => {
    setSearchValue(value);
    let newInnerTreeData = [];
    if (value) {
      newInnerTreeData = innerTreeData.map((itd) => {
        if (itd.title.toLowerCase().includes(value.toLowerCase())) {
          itd.isSearch = true;
        } else {
          itd.isSearch = false;
        }
        return itd;
      });
    } else {
      newInnerTreeData = innerTreeData.map((itd) => {
        itd.isSearch = false;
        return itd;
      });
    }
    setInnerTreeData(newInnerTreeData);
  };

  async function handleJsonDownload() {
    setDownloadLoading(true);
    const url = await getFullLinkTraceDownloadUrl(session?.sessionId, session?.database?.dbName, {
      sql: sql,
      tag: traceId,
    });
    if (url) {
      await downloadFile(url);
    }
    setDownloadLoading(false);
  }
  return (
    <Drawer
      open={open}
      width={912}
      title={
        formatMessage({
          id: 'odc.src.page.Workspace.components.Trace.FullLinkTraceDetails',
          defaultMessage: '全链路 Trace 详情',
        }) //'全链路 Trace 详情'
      }
      destroyOnClose={true}
      onClose={() => setOpen()}
    >
      <div className={styles.infoContainer}>
        <Row>
          <Col span={24} className={styles.info}>
            <span className={styles.infoLabel}>SQL: </span>
            <span className={styles.infoValue}>{sql}</span>
          </Col>
        </Row>
        <Row>
          <Col span={12} className={styles.info}>
            <span className={styles.infoLabel}>Trace ID: </span>
            <span className={styles.infoValue}>{traceId}</span>
            <CopyToClipboard
              key="copy"
              text={traceId}
              style={{
                marginLeft: '8px',
              }}
              onCopy={() => {
                message.success(
                  formatMessage({
                    id: 'odc.src.page.Workspace.components.Trace.Replication',
                    defaultMessage: '复制成功',
                  }), //'复制成功'
                );
              }}
            >
              <CopyOutlined />
            </CopyToClipboard>
          </Col>
          <Col span={8} className={styles.info}>
            <span className={styles.infoLabel}>
              {
                formatMessage({
                  id: 'odc.src.page.Workspace.components.Trace.StartingTime',
                  defaultMessage: '开始时间: ',
                }) /* 开始时间:  */
              }
            </span>
            <span className={styles.infoValue}>{originStartTimestamp}</span>
          </Col>

          <Col span={4} className={styles.info}>
            <span className={styles.infoLabel}>
              {
                formatMessage({
                  id: 'odc.src.page.Workspace.components.Trace.Duration',
                  defaultMessage: '持续时间: ',
                }) /* 持续时间:  */
              }
            </span>
            <span className={styles.infoValue}>
              {formatTimeTemplatMicroSeconds(totalElapseMicroSeconds)}
            </span>
          </Col>
        </Row>
      </div>
      <div className={styles.optContainer}>
        <Radio.Group value={tabName} onChange={(e) => setTabName(e.target.value)}>
          <Radio.Button value={TraceTabsType.Trace}>
            {
              formatMessage({
                id: 'odc.src.page.Workspace.components.Trace.TraceView',
                defaultMessage: 'Trace 视图',
              }) /* Trace 视图 */
            }
          </Radio.Button>
          <Radio.Button value={TraceTabsType.List}>
            {
              formatMessage({
                id: 'odc.src.page.Workspace.components.Trace.ListView',
                defaultMessage: '列表视图',
              }) /* 列表视图 */
            }
          </Radio.Button>
        </Radio.Group>
        <div className={styles.rightSide}>
          <Input.Search
            style={{
              width: '256px',
            }}
            placeholder={
              formatMessage({
                id: 'odc.src.page.Workspace.components.Trace.SearchForTheKeyword',
                defaultMessage: '搜索关键字',
              }) /* 搜索关键字 */
            }
            onSearch={onSearch}
          />

          <Button loading={downloadLoading} disabled={downloadLoading} onClick={handleJsonDownload}>
            {
              formatMessage({
                id: 'odc.src.page.Workspace.components.Trace.ExportJson',
                defaultMessage: '\n            导出 Json\n          ',
              }) /* 
            导出 Json
            */
            }
          </Button>
          <Tooltip
            placement="left"
            title={
              formatMessage({
                id: 'odc.src.page.Workspace.components.Trace.ExportTheJSONFileThat',
                defaultMessage: '导出符合 OpenTracing 规范的 Json 文件，可导入 Jaeger 查看',
              }) //'导出符合 OpenTracing 规范的 Json 文件，可导入 Jaeger 查看'
            }
          >
            <QuestionCircleOutlined
              style={{
                marginRight: '8px',
                cursor: 'pointer',
              }}
            />
          </Tooltip>
        </div>
      </div>
      <TraceComp
        tabName={tabName}
        traceId={traceId}
        sql={sql}
        session={session}
        searchValue={searchValue}
        updateTotalElapseMicroSeconds={setTotalElapseMicroSeconds}
        updateOriginStartTimestamp={setOriginStartTimestamp}
      />
    </Drawer>
  );
};
export default Trace;
