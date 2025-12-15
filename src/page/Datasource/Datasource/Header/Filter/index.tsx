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

import { getAllConnectTypes } from '@/common/datasource';
import CheckboxTag from '@/component/CheckboxTag';
import { ConnectTypeText } from '@/constant/label';
import { ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover, Space, Tooltip, Typography } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import ParamContext from '../../ParamContext';
import FilterIcon from '@/component/Button/FIlterIcon';
import styles from '../index.less';

interface IProps {}

const Filter: React.FC<IProps> = function ({}) {
  const context = useContext(ParamContext);
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  function clear() {
    context.setConnectType([]);
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const { connectType } = context;
  let selectedNames = [];
  connectType?.forEach((c) => {
    selectedNames.push(ConnectTypeText(c));
  });

  const isActive = useMemo(() => {
    return Boolean(connectType?.length);
  }, [connectType]);
  const comma = (idx, length) => {
    return idx !== length - 1 && <>，</>;
  };
  const tipContent = () => {
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
  };

  return (
    <Popover
      placement="bottomRight"
      overlayStyle={{ width: 300 }}
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Text strong>
            {
              formatMessage({
                id: 'odc.Header.Filter.FilterDataSources',
                defaultMessage: '筛选数据源',
              }) /*筛选数据源*/
            }
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
                {formatMessage({ id: 'odc.Header.Filter.Type', defaultMessage: '类型' }) /*类型*/}
              </Typography.Text>
              <CheckboxTag
                value={context?.connectType}
                options={[]
                  .concat(getAllConnectTypes())
                  .map((v) => ({ label: ConnectTypeText(v), value: v }))}
                onChange={(v) => {
                  context.setConnectType(v as ConnectType[]);
                }}
              />
            </Space>
          </Space>
        </div>
      }
    >
      <FilterIcon border isActive={isActive}>
        <Tooltip
          title={open ? undefined : tipContent()}
          open={!open && hover && isActive}
          overlayClassName={styles.filterTooltip}
        >
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <FilterOutlined />
          </div>
        </Tooltip>
      </FilterIcon>
    </Popover>
  );
};

export default Filter;
