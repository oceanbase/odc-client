import { listMaskingAlgorithm } from '@/common/network/maskingAlgorithm';
import TooltipContent from '@/component/TooltipContent';
import { IResponseData, MaskRyleTypeMap } from '@/d.ts';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { IRule } from '@/d.ts/rule';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import SecureTable from '../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode, ITableLoadOptions } from '../components/SecureTable/interface';
import ViewMaskingAlgorithmDrawer from './components/ViewMaskingAlgorithmDrawer';

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
        title: '算法名称',
        width: 218,
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '脱敏方式',
        width: 94,
        dataIndex: 'type',
        key: 'type',
        render: (text) => <TooltipContent content={MaskRyleTypeMap[text]} />,
      },
      {
        title: '测试数据',
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
        title: '结果预览',
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
        render: (text) => <TooltipContent content={text} />,
      },
      {
        title: '操作',
        width: 80,
        key: 'action',
        render: (_, record, index) => (
          <>
            <Space>
              <a onClick={() => handleViewDrawerOpen(record)}>查看</a>
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
    <>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        titleContent={null}
        showToolbar={false}
        showPagination={true}
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
    </>
  );
};

export default MaskingAlgorithm;
