/*
 * Copyright 2024 OceanBase
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

import { listMaskingAlgorithm } from '@/common/network/maskingAlgorithm';
import TooltipContent from '@/component/TooltipContent';
import { IResponseData } from '@/d.ts';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { IRule } from '@/d.ts/rule';
import { formatMessage } from '@/util/intl';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useRef, useState } from 'react';
import ViewMaskingAlgorithmDrawer from './components/ViewMaskingAlgorithmDrawer';
import CommonTable from '@/component/CommonTable';
import { ITableLoadOptions } from '@/component/CommonTable/interface';

export const maskRuleTypeMap = {
  // 掩盖
  MASK: formatMessage({ id: 'odc.src.d.ts.CoverUp' }), //掩盖 // 替换
  SUBSTITUTION: formatMessage({ id: 'odc.src.d.ts.Replace' }), //替换 // 保留格式
  PSEUDO: formatMessage({ id: 'odc.src.d.ts.ReservedFormat' }), //保留格式 // 哈希
  HASH: formatMessage({ id: 'odc.src.d.ts.Hash' }), //哈希 // 取整
  ROUNDING: formatMessage({ id: 'odc.src.d.ts.Rounding' }), //取整 // 置空
  NULL: formatMessage({ id: 'odc.src.d.ts.Empty' }), //置空
};
interface MaskingAlgorithmProps {}
const MaskingAlgorithm: React.FC<MaskingAlgorithmProps> = ({}) => {
  const tableRef = useRef<any>(null);
  const [maskingAlgorithm, setMaskingAlgorithm] = useState<IResponseData<IMaskingAlgorithm>>(null);
  const [selectedData, setSelectedData] = useState<IMaskingAlgorithm>(null);
  const [visible, setVisible] = useState<boolean>(false);

  const getColumns: (columnsFunction: { handleViewDrawerOpen }) => ColumnsType<IRule> = ({
    handleViewDrawerOpen,
  }) => {
    return [
      {
        title: formatMessage({ id: 'odc.Secure.MaskingAlgorithm.AlgorithmName' }), //算法名称
        width: 218,
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: formatMessage({ id: 'odc.Secure.MaskingAlgorithm.DesensitizationMethod' }), //脱敏方式
        width: 94,
        dataIndex: 'type',
        key: 'type',
        render: (text) => <TooltipContent content={maskRuleTypeMap[text]} />,
      },
      {
        title: formatMessage({ id: 'odc.Secure.MaskingAlgorithm.TestData' }), //测试数据
        width: 150,
        dataIndex: 'sampleContent',
        key: 'sampleContent',
        onCell: () => {
          return {
            style: {
              maxWidth: '150px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          };
        },
        render: (text) => <TooltipContent content={text} />,
      },
      {
        title: formatMessage({ id: 'odc.Secure.MaskingAlgorithm.ResultPreview' }), //结果预览
        width: 378,
        dataIndex: 'maskedContent',
        key: 'maskedContent',
        onCell: () => {
          return {
            style: {
              maxWidth: '378px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          };
        },
        render: (text) => <TooltipContent content={text || '-'} />,
      },
      {
        title: formatMessage({ id: 'odc.Secure.MaskingAlgorithm.Operation' }), //操作
        width: 80,
        key: 'action',
        render: (_, record, index) => (
          <>
            <Space>
              <a onClick={() => handleViewDrawerOpen(record)}>
                {formatMessage({ id: 'odc.Secure.MaskingAlgorithm.View' }) /*查看*/}
              </a>
            </Space>
          </>
        ),
      },
    ];
  };

  const initData = async (args?: ITableLoadOptions) => {
    const { searchValue, filters, sorter, pagination, pageSize } = args ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const data = {
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const rawData = await listMaskingAlgorithm(data);
    setMaskingAlgorithm(rawData);
  };

  const handleViewDrawerOpen = (record: IMaskingAlgorithm) => {
    setSelectedData(record);
    setVisible(true);
  };

  const handleViewDrawerClose = () => {
    setVisible(false);
  };

  const columns: ColumnsType<IRule> = getColumns({
    handleViewDrawerOpen,
  });

  return (
    <div style={{ height: '100%', flexGrow: 1 }}>
      <CommonTable
        ref={tableRef}
        titleContent={null}
        showToolbar={false}
        filterContent={{}}
        operationContent={{
          options: [],
        }}
        onLoad={initData}
        onChange={initData}
        tableProps={{
          columns,
          dataSource: maskingAlgorithm?.contents,
          rowKey: 'id',
          pagination: {
            current: maskingAlgorithm?.page?.number,
            total: maskingAlgorithm?.page?.totalElements,
          },
          scroll: {
            x: 1000,
          },
        }}
      />

      <ViewMaskingAlgorithmDrawer
        {...{
          visible,
          selectedData,
          handleViewDrawerClose,
        }}
      />
    </div>
  );
};

export default MaskingAlgorithm;
