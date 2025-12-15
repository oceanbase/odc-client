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

import { ConnectTypeText, DBTypeText } from '@/constant/label';
import { ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover, Space, Typography, Tooltip } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import ParamContext from '../../ParamContext';
import { getAllConnectTypes, getAllDBTypes } from '@/common/datasource';
import CheckboxTag from '@/component/CheckboxTag';
import { DBType } from '@/d.ts/database';
import settingStore from '@/store/setting';
import FilterIcon from '@/component/Button/FIlterIcon';
import styles from '../index.less';

interface IProps {}

const Filter: React.FC<IProps> = function ({}) {
  const context = useContext(ParamContext);
  const { connectType, type, environmentId } = context?.filterParams;
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  let displayDom = (
    <FilterIcon>
      <FilterOutlined />
    </FilterIcon>
  );

  function clear() {
    context.setFilterParams({
      connectType: [],
      environmentId: [],
      type: [],
    });
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
  };
  const comma = (idx, length) => {
    return idx !== length - 1 && <>，</>;
  };
  const tipContent = () => {
    return (
      <div>
        {connectTypeTipContent}
        {typeTipContent}
        {environmentTipContent}
      </div>
    );
  };
  const connectTypeTipContent = useMemo(() => {
    if (!connectType?.length) return null;
    return (
      <div>
        <span>
          {formatMessage({
            id: 'src.page.Project.Database.Header.Filter.ADA9E6A7',
            defaultMessage: '数据源类型',
          })}
        </span>
        ：
        {connectType?.map((name, index) => (
          <>
            <span key={name}>{ConnectTypeText?.(name)}</span>
            {comma(index, connectType?.length)}
          </>
        ))}
      </div>
    );
  }, [connectType]);
  const typeTipContent = useMemo(() => {
    if (!type?.length) return null;
    return (
      <div>
        <span>
          {formatMessage({
            id: 'src.page.Project.Database.Header.Filter.BCBEF8AA',
            defaultMessage: '数据库类型',
          })}
        </span>
        ：
        {type?.map((name, index) => (
          <>
            <span key={name}>{DBTypeText[name]}</span>
            {comma(index, type?.length)}
          </>
        ))}
      </div>
    );
  }, [type]);
  const environmentTipContent = useMemo(() => {
    if (!environmentId?.length) return null;
    return (
      <div>
        <span>
          {formatMessage({
            id: 'src.page.Project.Database.Header.Filter.F048B0EE',
            defaultMessage: '环境',
          })}
        </span>
        ：
        {environmentId?.map((name, index) => (
          <>
            <span key={name}>{context?.envList?.find((i) => i?.id === name)?.name}</span>
            {comma(index, environmentId?.length)}
          </>
        ))}
      </div>
    );
  }, [environmentId]);
  const isActive = useMemo(() => {
    return Boolean(connectType?.length || type?.length || environmentId?.length);
  }, [connectType, type, environmentId]);

  return (
    <Popover
      placement="bottomRight"
      overlayStyle={{ width: 300 }}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Text strong>
            {formatMessage({
              id: 'src.page.Project.Database.Header.Filter.3C4103AA',
              defaultMessage: '筛选',
            })}
          </Typography.Text>
          <a onClick={clear}>
            {formatMessage({ id: 'odc.Header.Filter.Clear', defaultMessage: '清空' }) /*清空*/}
          </a>
        </div>
      }
      content={
        <div>
          <Space direction="vertical" size={16}>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.page.Project.Database.Header.Filter.ADA9E6A7',
                  defaultMessage: '数据源类型',
                })}
              </Typography.Text>
              <CheckboxTag
                value={context?.filterParams?.connectType}
                options={[]
                  .concat(getAllConnectTypes())
                  .map((v) => ({ label: ConnectTypeText(v), value: v }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    connectType: v as ConnectType[],
                  });
                }}
              />
            </Space>
            {settingStore?.enableLogicaldatabase ? (
              <Space direction="vertical" size={5}>
                <Typography.Text type="secondary">
                  {formatMessage({
                    id: 'src.page.Project.Database.Header.Filter.BCBEF8AA',
                    defaultMessage: '数据库类型',
                  })}
                </Typography.Text>
                <CheckboxTag
                  value={context?.filterParams?.type}
                  options={[]
                    .concat(getAllDBTypes())
                    .map((v) => ({ label: DBTypeText[v], value: v }))}
                  onChange={(v) => {
                    context.setFilterParams({
                      ...context?.filterParams,
                      type: v as DBType[],
                    });
                  }}
                />
              </Space>
            ) : null}
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.page.Project.Database.Header.Filter.F048B0EE',
                  defaultMessage: '环境',
                })}
              </Typography.Text>
              <CheckboxTag
                value={context?.filterParams?.environmentId}
                options={[].concat(context?.envList).map((v) => ({ label: v?.name, value: v?.id }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    environmentId: v as number[],
                  });
                }}
              />
            </Space>
          </Space>
        </div>
      }
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
    >
      <FilterIcon border isActive={isActive}>
        <Tooltip
          title={open ? undefined : tipContent()}
          open={!open && hover && isActive}
          overlayClassName={styles.filterTooltip}
        >
          <div
            className={styles.filterIconContainer}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <FilterOutlined />
          </div>
        </Tooltip>
      </FilterIcon>
    </Popover>
  );
};

export default Filter;
