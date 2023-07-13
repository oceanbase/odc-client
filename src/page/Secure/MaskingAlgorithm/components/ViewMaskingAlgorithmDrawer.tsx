import { detailMaskingAlgorithm, testMaskingAlgorithm } from '@/common/network/maskingAlgorithm';
import { MaskRyleTypeMap } from '@/d.ts';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { Button, Descriptions, Drawer, Input, message } from 'antd';
import { useEffect, useState } from 'react';

const ViewMaskingAlgorithmDrawer = ({ visible, selectedData, handleViewDrawerClose }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [detailMaskingAlgorithmData, setDetailMaskingAlgorithmData] = useState<IMaskingAlgorithm>();

  const handleSearchTextChange = async (e) => {
    setSearchText(e.target.value);
  };
  const handleDetailMaskingAlgorithm = async () => {
    const rawData = await detailMaskingAlgorithm(selectedData.id);
    setDetailMaskingAlgorithmData(rawData);
  };
  const handleMaskingTest = async () => {
    if (searchText === '') {
      return message.error('测试数据不能为空');
    }
    setShowResult(true);
    const result = await testMaskingAlgorithm({
      ...detailMaskingAlgorithmData,
      sampleContent: searchText,
    });
    setTestResult(result?.maskedContent);
  };
  const reset = () => {
    setSearchText('');
    setTestResult('');
    setShowResult(false);
  };
  useEffect(() => {
    if (visible) {
      handleDetailMaskingAlgorithm();
    }
    if (selectedData?.maskedContent) {
      setSearchText(selectedData?.sampleContent);
    } else {
      setSearchText('default text content');
    }
    return () => {
      reset();
    };
  }, [visible]);

  return (
    <Drawer
      width={520}
      visible={visible}
      title={'脱敏规则详情'}
      onClose={handleViewDrawerClose}
      destroyOnClose={true}
      maskClosable={false}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleViewDrawerClose}>关闭</Button>
        </div>
      }
    >
      <Descriptions column={1}>
        <Descriptions.Item label={'规则名称'}>{selectedData?.name}</Descriptions.Item>
        <Descriptions.Item label={'规则状态'}>
          {selectedData?.enabled ? '启用' : '未启用'}
        </Descriptions.Item>
        <Descriptions.Item label={'脱敏方式'}>
          {MaskRyleTypeMap[selectedData?.type]}
        </Descriptions.Item>
        <Descriptions.Item label={'脱敏效果'}>&nbsp;</Descriptions.Item>
      </Descriptions>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '8px',
          backgroundColor: '#F7F9FB',
          padding: '16px',
        }}
      >
        <div>
          <span>测试数据</span>
          <div style={{ display: 'flex', columnGap: '8px' }}>
            <Input
              value={searchText}
              {...(selectedData?.id === 19
                ? {
                    // 数值取整 这里要用InputNumbe
                    type: 'number',
                  }
                : {})}
              onChange={handleSearchTextChange}
              placeholder="请输入"
              style={{ width: '240px' }}
            />
            <Button onClick={handleMaskingTest}>脱敏验证</Button>
          </div>
        </div>
        <div>
          <span>结果预览</span>
          <div style={{ display: 'flex', columnGap: '8px' }}>
            <Input
              placeholder="请输入"
              style={{ width: '240px' }}
              value={testResult}
              readOnly={!showResult}
              disabled={!showResult}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ViewMaskingAlgorithmDrawer;
