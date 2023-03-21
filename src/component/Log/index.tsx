import { formatMessage } from '@/util/intl';
import { getPrefixCls } from '@/util/utils';
import {
  CopyOutlined,
  DownloadOutlined,
  FileSearchOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import { Empty, message, Space, Spin, Typography } from 'antd';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { AutoSizer, List as VirtualList } from 'react-virtualized';
import Line from './component/Line';
import SearchComponent from './component/Search';
import { useHeight, useLazyLogData } from './hooks';
import type { LogProps } from './typings';
import { dealData, download } from './utils';

import { registerLanguage } from './languageHighlight';

import './style/index.less';

const noop = () => {};

const Log: React.FC<LogProps> = ({
  value,
  onSearch,
  loading = false,
  searchTrigger = 'click',
  style = {},
  emptyDescription = formatMessage({ id: 'odc.component.Log.NoDataAvailable' }), //暂无数据
  onReload,
  defaultPosition = 'start',
  ignoreCase = false,
  enableDownload = true,
  enableCopy = true,
  enableHighLight = false,
  language,
}) => {
  /** 关键字 */
  const [keyword, setkeyword] = useState('');
  /** 控制搜索显示 */
  const [searchInputVisible, setSearchInputVisible] = useState(false);
  /** 关键字位置索引/总数 */
  const [current, setCurrent] = useState(0);
  /** 定位的索引 */
  const [scrollIndex, setScrollIndex] = useState(-1);

  const keywordRef = useRef<string>('');
  const logContent = useRef(null);
  const selectAllTag = useRef(false);
  const copyData = useRef<{
    isMouseDown?: boolean;
    anchorNode?: any;
    scrollTop?: number;
    scrollDirection?: 'up' | 'down';
  }>(null);
  const getHeight = useHeight(logContent);
  const logData = useLazyLogData(value || '', keyword, ignoreCase);
  const prefixCls = getPrefixCls('log');
  const controlled = searchTrigger === 'click';

  const actionList = [
    {
      key: 'find',
      icon: <FileSearchOutlined />,
      text: formatMessage({ id: 'odc.component.Log.Find' }), //查找
      onClick: () => {
        setSearchInputVisible(!searchInputVisible);
      },
    },

    {
      key: 'download',
      icon: <DownloadOutlined />,
      text: formatMessage({ id: 'odc.component.Log.Download' }), //下载
      visible: enableDownload,
      onClick: () => (logData.data.length ? download(logData.data) : noop),
    },

    {
      key: 'copy',
      icon: <CopyOutlined />,
      text: (
        <CopyToClipboard
          text={logData.data.length ? dealData(logData.data).copyStr : ''}
          onCopy={(_, result: boolean) => {
            if (logData.data.length) {
              if (result) {
                message.success(
                  formatMessage({ id: 'odc.component.Log.CopiedSuccessfully' }), //复制成功
                );
              } else {
                message.error(
                  formatMessage({ id: 'odc.component.Log.ReplicationFailed' }), //复制失败
                );
              }
            }
          }}
        >
          <span>{formatMessage({ id: 'odc.component.Log.Copy' }) /*复制*/}</span>
        </CopyToClipboard>
      ),

      visible: enableCopy,
    },
  ];

  if (onReload) {
    actionList.push({
      key: 'refresh',
      icon: <RedoOutlined />,
      text: formatMessage({ id: 'odc.component.Log.Refresh' }), //刷新
      onClick: onReload,
    });
  }

  const searchKeyword = (text: string) => {
    setCurrent(0);
    setScrollIndex(0);
    setkeyword(text);
    onSearch?.(text);
  };

  /** 防抖 */
  const debouncedWord = useDebounceFn(searchKeyword, { wait: 500 });

  const searchKey = (text: string) => {
    if (controlled) {
      keywordRef.current = text;
    } else {
      debouncedWord.run(text);
    }
  };

  /** 点击查找片段 */
  const manualSearch = async () => {
    setCurrent(0);
    if (onSearch) {
      await onSearch(keywordRef.current);
    }
    setkeyword(keywordRef.current);
  };

  /** 上翻 */
  const pre = () => {
    setCurrent(current - 1);
    setScrollIndex(logData.searchResultIndexList[current - 1]);
  };

  /** 下翻 */
  const next = () => {
    setCurrent(current + 1);
    setScrollIndex(logData.searchResultIndexList[current + 1]);
  };

  const onClose = () => {
    setSearchInputVisible(false);
  };

  const reset = () => {
    setkeyword('');
    setCurrent(0);
    setScrollIndex(-1);
    onSearch?.('');
  };

  const onWrapperKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    /** 按下ctrl + F || command + F  70 => F */
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      /** 取消默认事件，隐藏浏览器自带的搜索 */
      event.preventDefault();
      event.stopPropagation();
      setSearchInputVisible(!searchInputVisible);
    }
  };

  useEffect(() => {
    if (!searchInputVisible || !keywordRef.current) {
      reset();
    }
  }, [searchInputVisible, keywordRef.current]);

  useEffect(() => {
    if (keyword && logData.foundCount) {
      setScrollIndex(logData.searchResultIndexList[current]);
    }
  }, [keyword, logData.foundCount]);

  useEffect(() => {
    if (defaultPosition === 'end' && logData.data.length > 0 && !keyword) {
      setScrollIndex(logData.data.length - 1);
    }
  }, [logData.data.length, keyword]);

  useEffect(() => {
    if (enableHighLight) {
      registerLanguage(language, true);
    }
  }, [enableHighLight]);

  const getLineWrapNode = (node: HTMLElement) => {
    if (!node || node?.classList?.contains('tech-log-line-wrap')) {
      return node;
    } else {
      return getLineWrapNode(node.parentElement);
    }
  };

  const getLineIndexByNode = (node: HTMLElement) => {
    const lineWrapNode = getLineWrapNode(node);
    let index = null;
    if (!lineWrapNode) {
      index = copyData.current.scrollDirection === 'up' ? 0 : logData.data.length;
    } else {
      index = Number(lineWrapNode.firstChild.innerText);
    }
    return index;
  };

  const handleKeyDown = (e) => {
    e.preventDefault();
    // 全选
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 65) {
      selectAllTag.current = true;
      getSelection().selectAllChildren(logContent.current);
    }
    // 复制
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 67) {
      const { anchorNode, scrollDirection } = copyData.current ?? {};
      let copyStr = getSelection().toLocaleString();
      if (selectAllTag.current) {
        copyStr = dealData(logData.data).copyStr;
      }
      if (anchorNode) {
        const focusNode = getSelection().focusNode;
        const anchorIndex = getLineIndexByNode(anchorNode);
        const focusIndex = getLineIndexByNode(focusNode as HTMLElement);
        const startIndex = scrollDirection === 'down' ? anchorIndex : focusIndex;
        const endIndex = scrollDirection === 'down' ? focusIndex : anchorIndex;
        const data = logData.data.slice(startIndex, endIndex + 1);
        copyStr = dealData(data).copyStr;
      }
      copy(copyStr);
    }
  };

  const handleWrapClick = () => {
    selectAllTag.current = false;
  };

  const handleMouseDown = () => {
    copyData.current = {
      isMouseDown: true,
    };
  };

  const handleMouseUp = () => {
    copyData.current = {
      ...copyData.current,
      isMouseDown: false,
    };
  };

  const handleScroll = (e) => {
    const { isMouseDown, anchorNode, scrollTop } = copyData.current ?? {};
    if (isMouseDown && !anchorNode) {
      copyData.current = {
        ...copyData.current,
        anchorNode: getSelection().anchorNode,
        scrollTop: e.scrollTop,
      };
    }

    if (anchorNode) {
      copyData.current = {
        ...copyData.current,
        scrollDirection: e.scrollTop > scrollTop ? 'down' : 'up',
        scrollTop: e.scrollTop,
      };
    }
  };

  return (
    <div
      className={`${prefixCls}-wrap`}
      style={style}
      onKeyDown={onWrapperKeyDown}
      onClick={handleWrapClick}
    >
      <Space size={24} className={`${prefixCls}-toolbar-wrap`}>
        {actionList
          ?.filter(({ visible = true }) => !!visible)
          ?.map((item) => {
            return (
              <Space
                size={8}
                className={`${prefixCls}-toolbar`}
                onClick={item.onClick}
                key={item.key}
              >
                <Typography.Text className={`${prefixCls}-toolbar-text`}>
                  {item.icon}
                </Typography.Text>
                <Typography.Text className={`${prefixCls}-toolbar-text`}>
                  {item.text}
                </Typography.Text>
              </Space>
            );
          })}
      </Space>
      {searchInputVisible && (
        <SearchComponent
          total={logData.foundCount}
          current={current}
          pre={pre}
          next={next}
          onClose={onClose}
          manualSearch={manualSearch}
          onChange={searchKey}
          controlled={controlled}
          loading={loading}
        />
      )}

      <div
        className={`${prefixCls}-content`}
        ref={logContent}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {loading && <Spin className={`${prefixCls}-loading`} />}
        {!loading && logData.data.length === 0 && (
          <Empty
            className={`${prefixCls}-empty`}
            description={emptyDescription}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}

        {!loading && logData.data.length > 0 && (
          <AutoSizer>
            {({ height, width }) => (
              <VirtualList
                className={classNames(`${prefixCls}-vir-list`, {
                  [`${prefixCls}-highlight`]: enableHighLight,
                })}
                rowCount={logData.data.length}
                rowRenderer={({ key, index, style: _style }) => (
                  <Line
                    data={logData.data[index]}
                    style={_style}
                    current={current}
                    searchData={logData.searchResultMap}
                    key={key}
                    enableHighLight={enableHighLight}
                    language={language}
                  />
                )}
                height={height}
                width={width}
                rowHeight={({ index }) => {
                  const { content, rowIndex } = logData.data[index];
                  return getHeight(content, rowIndex);
                }}
                overscanRowCount={10}
                scrollToIndex={scrollIndex}
                onScroll={handleScroll}
                scrollToAlignment="center"
              />
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
};

export default Log;
