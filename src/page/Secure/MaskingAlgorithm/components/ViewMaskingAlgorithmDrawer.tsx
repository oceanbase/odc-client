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
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { formatMessage } from '@/util/intl';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Drawer, Input, message, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { maskRuleTypeMap } from '..';
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
          defaultMessage: '测试数据不能为空',
        }), //测试数据不能为空
      );
    }

    setShowResult(true);
    const result = await testMaskingAlgorithm(detailMaskingAlgorithmData.id, searchText);
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
          defaultMessage: '脱敏算法详情',
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
                defaultMessage: '关闭',
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
              defaultMessage: '规则名称',
            }) //规则名称
          }
        >
          {selectedData?.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.RuleStatus',
              defaultMessage: '规则状态',
            }) //规则状态
          }
        >
          {
            selectedData?.enabled
              ? formatMessage({
                  id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.Enable',
                  defaultMessage: '启用',
                }) //启用
              : formatMessage({
                  id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.NotEnabled',
                  defaultMessage: '未启用',
                }) //未启用
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.DesensitizationMethod',
              defaultMessage: '脱敏方式',
            }) //脱敏方式
          }
        >
          {maskRuleTypeMap[selectedData?.type]}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.DesensitizationEffect',
              defaultMessage: '脱敏效果',
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '8px',
          }}
        >
          <span>
            {
              formatMessage({
                id: 'odc.src.page.Secure.MaskingAlgorithm.components.TestData',
                defaultMessage: '\n            测试数据\n            ',
              }) /* 
            测试数据
            */
            }

            <Tooltip
              title={
                formatMessage({
                  id: 'odc.src.page.Secure.MaskingAlgorithm.components.TheMaximumLength',
                  defaultMessage: '长度不超过 128 个字符',
                }) /* 最长长度 <= 128 */
              }
            >
              <QuestionCircleOutlined
                style={{
                  marginLeft: '8px',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
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
              maxLength={128}
              onChange={handleSearchTextChange}
              placeholder={formatMessage({
                id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.PleaseEnter',
                defaultMessage: '请输入',
              })}
              /*请输入*/ style={{
                width: '240px',
              }}
            />

            <Button onClick={handleMaskingTest}>
              {
                formatMessage({
                  id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.DesensitizationVerification',
                  defaultMessage: '脱敏验证',
                }) /*脱敏验证*/
              }
            </Button>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '8px',
          }}
        >
          <span>
            {
              formatMessage({
                id: 'odc.MaskingAlgorithm.components.ViewMaskingAlgorithmDrawer.ResultPreview',
                defaultMessage: '结果预览',
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
                defaultMessage: '请输入',
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
