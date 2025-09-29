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
import { CommonTableMode } from '@/component/CommonTable/interface';
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
                id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.PathRecognitionExpression',
                defaultMessage: '路径识别表达式',
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
                    defaultMessage: '匹配：',
                  }) /*匹配：*/
                }

                {pathIncludes.join(',')}
              </div>
              <div>
                {
                  formatMessage({
                    id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Exclude',
                    defaultMessage: '排除：',
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
            defaultMessage: '库名',
          }), //库名
          content: databaseRegexExpression,
        });
      }
      if (tableRegexExpression !== '') {
        dataSource.push({
          name: formatMessage({
            id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.TableName',
            defaultMessage: '表名',
          }), //表名
          content: tableRegexExpression,
        });
      }
      if (columnRegexExpression !== '') {
        dataSource.push({
          name: formatMessage({
            id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.ColumnName',
            defaultMessage: '列名',
          }), //列名
          content: columnRegexExpression,
        });
      }
      if (columnCommentRegexExpression !== '') {
        dataSource.push({
          name: formatMessage({
            id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.ColumnRemarks',
            defaultMessage: '列备注',
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
                defaultMessage: '识别规则',
              }) //识别规则
            }
          >
            &nbsp;
          </Descriptions.Item>
          <div className={styles.viewDrawerTable}>
            <CommonTable
              titleContent={null}
              mode={CommonTableMode.SMALL}
              showToolbar={false}
              filterContent={{
                searchPlaceholder: formatMessage({
                  id: 'odc.components.UserPage.EnterAUserOrAccount',
                  defaultMessage: '请输入用户/账号搜索',
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
                      defaultMessage: '规则名称',
                    }), //规则名称
                    width: 170,
                    dataIndex: 'name',
                    key: 'name',
                    render: (text) => text || '-',
                  },
                  {
                    title: formatMessage({
                      id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RegularExpression',
                      defaultMessage: '正则表达式',
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
                  hideOnSinglePage: true,
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
                defaultMessage: '识别规则',
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
    case SensitiveRuleType.AI: {
      const { aiSensitiveTypes = [], aiCustomPrompt = '' } = params;

      // 敏感类别映射表
      const sensitiveTypeMap = {
        'personal-name-chinese': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.PersonalNameChinese',
          defaultMessage: '个人姓名(汉字类型)',
        }),
        'personal-name-alphabet': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.PersonalNameAlphabet',
          defaultMessage: '个人姓名(字母类型)',
        }),
        nickname: formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.Nickname',
          defaultMessage: '昵称',
        }),
        email: formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.Email',
          defaultMessage: '邮箱',
        }),
        address: formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.Address',
          defaultMessage: '地址',
        }),
        'phone-number': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.PhoneNumber',
          defaultMessage: '手机号码',
        }),
        'fixed-line-phone-number': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.FixedLinePhoneNumber',
          defaultMessage: '固定电话',
        }),
        'certificate-number': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.CertificateNumber',
          defaultMessage: '证件号码',
        }),
        'bank-card-number': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.BankCardNumber',
          defaultMessage: '银行卡号',
        }),
        'license-plate-number': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.LicensePlateNumber',
          defaultMessage: '车牌号',
        }),
        'device-id': formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.DeviceId',
          defaultMessage: '设备唯一识别号',
        }),
        ip: formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.IpAddress',
          defaultMessage: 'IP 地址',
        }),
        mac: formatMessage({
          id: 'odc.SensitiveRule.components.DetectWay.MacAddress',
          defaultMessage: 'MAC 地址',
        }),
      };

      const displayTypes = aiSensitiveTypes
        ?.map((type) => sensitiveTypeMap[type] || type)
        .join(', ');

      return (
        <>
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.SensitiveTypes',
                defaultMessage: '敏感类别',
              }) //敏感类别
            }
          >
            {displayTypes || '-'}
          </Descriptions.Item>

          {aiCustomPrompt && (
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.CustomPrompt',
                  defaultMessage: '自定义提示词',
                }) //自定义提示词
              }
            >
              <div
                style={{
                  maxWidth: '400px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {aiCustomPrompt}
              </div>
            </Descriptions.Item>
          )}
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
          defaultMessage: '查看识别规则',
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
                defaultMessage: '关闭',
              }) /*关闭*/
            }
          </Button>
        </div>
      }
      rootClassName={styles.drawer}
    >
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RuleName',
              defaultMessage: '规则名称',
            }) //规则名称
          }
        >
          {record?.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RuleStatus',
              defaultMessage: '规则状态',
            }) //规则状态
          }
        >
          {
            record?.enabled
              ? formatMessage({
                  id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Enable',
                  defaultMessage: '启用',
                }) //启用
              : formatMessage({
                  id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.NotEnabled',
                  defaultMessage: '未启用',
                }) //未启用
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.IdentificationMethod',
              defaultMessage: '识别方式',
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
              defaultMessage: '脱敏算法',
            }) //脱敏算法
          }
        >
          {record?.type === SensitiveRuleType.AI
            ? '-'
            : maskingAlgorithmIdMap[record?.maskingAlgorithmId]}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.RuleDescription',
              defaultMessage: '规则描述',
            }) //规则描述
          }
        >
          {record?.description || '-'}
        </Descriptions.Item>
        <Divider />
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.Founder',
              defaultMessage: '创建人',
            }) //创建人
          }
        >
          {record?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.CreationTime',
              defaultMessage: '创建时间',
            }) //创建时间
          }
        >
          {getLocalFormatDateTime(record?.createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.ViewSensitiveRuleDrawer.UpdateTime',
              defaultMessage: '更新时间',
            }) //更新时间
          }
        >
          {getLocalFormatDateTime(record?.updateTime)}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};
export default ViewSensitiveRuleDrawer;
