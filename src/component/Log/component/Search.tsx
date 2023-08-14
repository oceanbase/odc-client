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
import { getPrefixCls } from '@/util/utils';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';

interface SearchComponentProps {
  /**
   * @title 搜索到关键字的总数
   * @description 搜索到关键字的总数
   */
  total: number;
  /**
   * @title 当前高亮关键字的索引
   * @description 当前高亮关键字的索引
   */
  current: number;
  /**
   * @title 搜索加载状态
   * @description 搜索加载状态
   */
  loading: boolean;
  /**
   * @title 跳到下一个关键字位置
   * @description 跳到下一个关键字位置
   */
  next: () => void;
  /**
   * @title 跳到上一个关键字位置
   * @description 跳到上一个关键字位置
   */
  pre: () => void;
  /**
   * @title 关闭搜索框
   * @description 关闭搜索框
   */
  onClose: () => void;
  /**
   * @title 手动触发搜索
   * @description 手动触发搜索, 与controlled 一起用,通常是像服务器发送搜索请求
   */
  manualSearch: () => void;
  /**
   * @title 搜索框关键字变化回调
   * @description 搜索框关键字变化回调
   */
  onChange: (value: string) => void;
  /**
   * @title 搜索框是否是受控组件
   * @description 搜索框是否是受控组件
   */
  controlled: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  total,
  current,
  next,
  pre,
  onClose,
  onChange,
  manualSearch,
  controlled,
  loading,
}) => {
  const prefixCls = getPrefixCls('log');
  return (
    <Row className={`${prefixCls}-search-wrap`}>
      <Col flex="auto" style={{ height: 32 }}>
        <Input
          onChange={(e) => onChange(e.target.value)}
          className={classNames(`${prefixCls}-search-input`, {
            [`${prefixCls}-search-input-controlled`]: controlled,
          })}
          allowClear
          suffix={controlled ? null : <SearchOutlined />}
        />
      </Col>
      {controlled && (
        <Col flex="none">
          <Button
            onClick={manualSearch}
            loading={loading}
            className={`${prefixCls}-manual-search-btn`}
          >
            {
              formatMessage({
                id: 'odc.Log.component.Search.FindClips',
              }) /*查找片段*/
            }
          </Button>
        </Col>
      )}

      <Col flex="none" className={`${prefixCls}-update-search-cursor`}>
        <Space size={16}>
          <span
            className={classNames(`${prefixCls}-search-count-info`, {
              [`${prefixCls}-searched-count-info`]: !!total,
            })}
          >
            {total ? `${current + 1}/${total}` : 0}
          </span>
          <Button
            className={`${prefixCls}-action-btn ${prefixCls}-action-pre`}
            icon={<ArrowUpOutlined />}
            type="text"
            disabled={current === 0}
            onClick={pre}
          />

          <Button
            className={`${prefixCls}-action-btn  ${prefixCls}-action-next`}
            icon={<ArrowDownOutlined />}
            type="text"
            disabled={current + 1 === total || total === 0}
            onClick={next}
          />

          <Button
            type="text"
            icon={<CloseOutlined />}
            className={`${prefixCls}-action-btn ${prefixCls}-action-search-close`}
            onClick={onClose}
          />
        </Space>
      </Col>
    </Row>
  );
};
export default SearchComponent;
