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

import { detailSensitiveRule } from '@/common/network/sensitiveRule';
import CommonTable from '@/component/CommonTable';
import MonacoEditor from '@/component/MonacoEditor';
import { ISensitiveRule, SensitiveRuleType } from '@/d.ts/sensitiveRule';
import { DetectRuleTypeMap } from '@/page/Project/Sensitive/interface';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button, Descriptions, Divider, Drawer } from 'antd';
import { useEffect, useLayoutEffect, useState } from 'react';
import styles from './index.less';

const renderByType = (type: SensitiveRuleType, params?: any) => {
  switch (type) {
    case SensitiveRuleType.PATH: {
      const { pathIncludes = [], pathExcludes = [] } = params;
      return (
        <>
          <Descriptions.Item
            label={
              formatMessage({
                id:
                  'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.PathRecognitionExpression',
              }) //路径识别表达式
            }
          >
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div>
                {
                  formatMessage({
                    id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Match',
                  }) /*匹配：*/
                }
                {pathIncludes.join(',')}
              </div>
              <div>
                {
                  formatMessage({
                    id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Exclude',
                  }) /*排除：*/
                }
                {pathExcludes.join(',') || '-'}
              </div>
            </span>
          </Descriptions.Item>
        </>
      );
    }
    case SensitiveRuleType.REGEX: {
      const {
        databaseRegexExpression = '',
        tableRegexExpression = '',
        columnRegexExpression = '',
        columnCommentRegexExpression = '',
      } = params;
      const dataSource = [];
      if (databaseRegexExpression !== '') {
        dataSource.push({
          name: formatMessage({
            id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.LibraryName',
          }), //库名
          content: databaseRegexExpression,
        });
      }
      if (tableRegexExpression !== '') {
        dataSource.push({
          name: formatMessage({
            id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.TableName',
          }), //表名
          content: tableRegexExpression,
        });
      }
      if (columnRegexExpression !== '') {
        dataSource.push({
          name: formatMessage({
            id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.ColumnName',
          }), //列名
          content: columnRegexExpression,
        });
      }
      if (columnCommentRegexExpression !== '') {
        dataSource.push({
          name: formatMessage({
            id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.ColumnRemarks',
          }), //列备注
          content: columnCommentRegexExpression,
        });
      }
      return (
        <>
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.IdentificationRules',
              }) //识别规则
            }
          >
            &nbsp;
          </Descriptions.Item>
          <div
            style={{
              width: '500px',
            }}
          >
            <CommonTable
              titleContent={null}
              showToolbar={false}
              filterContent={{
                searchPlaceholder: formatMessage({
                  id: 'odc.components.UserPage.EnterAUserOrAccount',
                }),
                /* 请输入用户/账号搜索 */
              }}
              operationContent={{
                options: [],
              }}
              onLoad={null}
              tableProps={{
                columns: [
                  {
                    title: formatMessage({
                      id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RuleName',
                    }), //规则名称
                    width: 170,
                    dataIndex: 'name',
                    key: 'name',
                    render: (text) => text || '-',
                  },
                  {
                    title: formatMessage({
                      id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RegularExpression',
                    }), //正则表达式
                    width: 170,
                    dataIndex: 'content',
                    key: 'content',
                    render: (text) => text || '-',
                  },
                ],

                dataSource: dataSource,
                rowKey: 'id',
                pagination: {
                  pageSize: 4,
                },
                scroll: {
                  x: 564,
                },
              }}
            />
          </div>
        </>
      );
    }
    case SensitiveRuleType.GROOVY: {
      const { groovyScript = '' } = params;
      return (
        <>
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.IdentificationRules',
              }) //识别规则
            }
          >
            &nbsp;
          </Descriptions.Item>
          <div
            style={{
              position: 'relative',
              height: '300px',
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--neutral-grey1-color)',
            }}
          >
            <div
              style={{
                paddingBottom: '8px',
                height: '300px',
                width: '100%',
                position: 'relative',
                overflowY: 'hidden',
              }}
            >
              <MonacoEditor
                language={'groovy'}
                defaultValue={groovyScript}
                readOnly={true}
                {...{
                  lineNumbers: 'off',
                }}
              />
            </div>
          </div>
        </>
      );
    }
  }
};
const ViewSensitiveRuleDrawer = ({
  viewDrawerVisible,
  handleViewDrawerClose,
  projectId,
  sensitiveRuleId,
  selectedRecord,
  maskingAlgorithmIdMap,
}) => {
  const [record, setRecord] = useState<ISensitiveRule>(selectedRecord);
  const getDetailSensitiveRule = async (projectId: number, sensitiveRuleId: number) => {
    const rawData = await detailSensitiveRule(projectId, sensitiveRuleId);
    setRecord({
      ...selectedRecord,
      ...rawData,
    });
  };

  useEffect(() => {
    if (viewDrawerVisible && sensitiveRuleId && projectId) {
      getDetailSensitiveRule(projectId, sensitiveRuleId);
    }
  }, [viewDrawerVisible]);

  useLayoutEffect(() => {
    setRecord(selectedRecord);
  }, [selectedRecord]);
  return (
    <Drawer
      width={596}
      title={
        formatMessage({
          id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.ViewIdentificationRules',
        }) //查看识别规则
      }
      open={viewDrawerVisible}
      onClose={handleViewDrawerClose}
      destroyOnClose={true}
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
                id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Close',
              }) /*关闭*/
            }
          </Button>
        </div>
      }
      className={styles.drawer}
    >
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RuleName' }) //规则名称
          }
        >
          {record?.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RuleStatus' }) //规则状态
          }
        >
          {
            record?.enabled
              ? formatMessage({ id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Enable' }) //启用
              : formatMessage({
                  id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.NotEnabled',
                }) //未启用
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.IdentificationMethod',
            }) //识别方式
          }
        >
          {DetectRuleTypeMap[record?.type]}
        </Descriptions.Item>
        <Divider />
        {renderByType(record?.type, record)}
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.DesensitizationAlgorithm',
            }) //脱敏算法
          }
        >
          {maskingAlgorithmIdMap[record?.maskingAlgorithmId]}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RuleDescription',
            }) //规则描述
          }
        >
          {record?.description || '-'}
        </Descriptions.Item>
        <Divider />
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Founder' }) //创建人
          }
        >
          {record?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.CreationTime',
            }) //创建时间
          }
        >
          {getLocalFormatDateTime(record?.createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.UpdateTime' }) //更新时间
          }
        >
          {getLocalFormatDateTime(record?.updateTime)}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};
export default ViewSensitiveRuleDrawer;
