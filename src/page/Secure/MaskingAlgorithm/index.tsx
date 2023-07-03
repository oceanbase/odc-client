import { listMaskingAlgorithm } from '@/common/network/maskingAlgorithm';
import TooltipContent from '@/component/TooltipContent';
import { MaskRyleTypeMap } from '@/d.ts';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { IRule } from '@/d.ts/rule';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import SecureTable from '../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode } from '../components/SecureTable/interface';
import ViewMaskingAlgorithmDrawer from './components/ViewMaskingAlgorithmDrawer';

interface MaskingAlgorithmProps {}
const MaskingAlgorithm: React.FC<MaskingAlgorithmProps> = ({}) => {
  const tableRef = useRef<any>(null);
  const [maskingAlgorithm, setMaskingAlgorithm] = useState<IMaskingAlgorithm[]>([]);
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

  const initData = async () => {
    const data = await listMaskingAlgorithm();
    setMaskingAlgorithm(data);
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

  useEffect(() => {
    initData();
  }, []);

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
        onLoad={null}
        tableProps={{
          columns,
          dataSource: maskingAlgorithm,
          rowKey: 'id',
          pagination: {
            // pageSize: 10,
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
