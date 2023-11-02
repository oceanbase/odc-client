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

import { detailMaskingAlgorithm, testMaskingAlgorithm } from '@/common/network/maskingAlgorithm';
import { MaskRyleTypeMap } from '@/d.ts';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { formatMessage } from '@/util/intl';
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
      return message.error(
        formatMessage({
          id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.TestDataCannotBeEmpty',
        }), //测试数据不能为空
      );
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
      open={visible}
      title={
        formatMessage({
          id: 'odc.src.page.Secure.MaskingAlgorithm.components.DesertensitivityAlgorithmDetails',
        }) //'脱敏算法详情'
      }
      onClose={handleViewDrawerClose}
      destroyOnClose={true}
      maskClosable={false}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={handleViewDrawerClose}>
            {
              formatMessage({
                id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.Close',
              }) /*关闭*/
            }
          </Button>
        </div>
      }
    >
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.RuleName',
            }) //规则名称
          }
        >
          {selectedData?.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.RuleStatus',
            }) //规则状态
          }
        >
          {
            selectedData?.enabled
              ? formatMessage({
                  id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.Enable',
                }) //启用
              : formatMessage({
                  id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.NotEnabled',
                }) //未启用
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id:
                'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.DesensitizationMethod',
            }) //脱敏方式
          }
        >
          {MaskRyleTypeMap[selectedData?.type]}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id:
                'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.DesensitizationEffect',
            }) //脱敏效果
          }
        >
          &nbsp;
        </Descriptions.Item>
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
          <span>
            {
              formatMessage({
                id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.TestData',
              }) /*测试数据*/
            }
          </span>
          <div
            style={{
              display: 'flex',
              columnGap: '8px',
            }}
          >
            <Input
              value={searchText}
              {...(selectedData?.id === 19
                ? {
                    // 数值取整 这里要用InputNumbe
                    type: 'number',
                  }
                : {})}
              onChange={handleSearchTextChange}
              placeholder={formatMessage({
                id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.PleaseEnter',
              })}
              /*请输入*/ style={{
                width: '240px',
              }}
            />

            <Button onClick={handleMaskingTest}>
              {
                formatMessage({
                  id:
                    'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.DesensitizationVerification',
                }) /*脱敏验证*/
              }
            </Button>
          </div>
        </div>
        <div>
          <span>
            {
              formatMessage({
                id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.ResultPreview',
              }) /*结果预览*/
            }
          </span>
          <div
            style={{
              display: 'flex',
              columnGap: '8px',
            }}
          >
            <Input
              placeholder={formatMessage({
                id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.PleaseEnter',
              })}
              /*请输入*/ style={{
                width: '240px',
              }}
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
