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

import { createSensitiveRule, updateSensitiveRule } from '@/common/network/sensitiveRule';
import { ISensitiveRule, SensitiveRuleType } from '@/d.ts/sensitiveRule';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Form, Input, message, Modal, Radio, Select, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useContext, useEffect, useState } from 'react';
import ProjectContext from '../../../../ProjectContext';
import SensitiveContext from '../../../SensitiveContext';
import DetectWay from './DetectWay';
import styles from './index.less';
import { MaskRyleTypeMap } from '@/d.ts';
import { PopoverContainer } from '../../SensitiveColumn';

const FormSensitiveRuleDrawer = ({
  formDrawerVisible,
  handleFormDrawerClose,
  isEdit,
  selectedRecord,
}) => {
  const [formRef] = useForm();
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [script, setScript] = useState<string>('');
  const [hasValidated, setHasValidated] = useState<boolean>(false);
  const handleSubmit = async () => {
    const rawData = await formRef.validateFields().catch();
    const { enabled, maskingAlgorithmId, name, type, regExp = {}, description } = rawData;
    if (type === SensitiveRuleType.GROOVY && script?.length === 0) {
      setHasValidated(true);
      return;
    }
    let data: Partial<ISensitiveRule> = {
      enabled,
      maskingAlgorithmId,
      name,
      type,
      projectId: context.projectId,
      description,
    };
    const wrapPath = (origin: string) => {
      if (origin?.includes(',')) {
        return origin?.split(',')?.map((o) => o.trim());
      }
      return origin === '' ? [] : [origin];
    };
    switch (type) {
      case SensitiveRuleType.PATH: {
        data = {
          ...data,
          pathIncludes: wrapPath(
            Array.isArray(rawData.pathIncludes)
              ? rawData?.pathIncludes?.join(',')
              : rawData.pathIncludes,
          ),
          pathExcludes: wrapPath(
            Array.isArray(rawData.pathExcludes)
              ? rawData?.pathExcludes?.join(',')
              : rawData.pathExcludes,
          ),
        };
        break;
      }
      case SensitiveRuleType.REGEX: {
        const resRegExp = {};
        Object.keys(regExp)?.forEach((key) => {
          if (regExp?.[key]?.checked?.length > 0) {
            resRegExp[`${key}`] = regExp[key].regExp;
          }
        });
        data = {
          ...data,
          ...resRegExp,
        };
        break;
      }
      case SensitiveRuleType.GROOVY: {
        data = {
          ...data,
          groovyScript: script,
        };
        break;
      }
    }
    if (isEdit) {
      const result = await updateSensitiveRule(
        context.projectId,
        selectedRecord.id,
        data as ISensitiveRule,
      );
      if (result) {
        message.success(
          formatMessage({
            id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.UpdatedSuccessfully',
          }), //更新成功
        );
        handleFormDrawerClose(formRef.resetFields);
      } else {
        message.error(
          formatMessage({
            id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.UpdateFailed',
          }), //更新失败
        );
      }
    } else {
      const result = await createSensitiveRule(context.projectId, data);
      if (result) {
        message.success(
          formatMessage({ id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.New' }), //新建成功
        );
        handleFormDrawerClose();
      } else {
        message.error(
          formatMessage({
            id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.FailedToCreate',
          }), //新建失败
        );
      }
    }
    setHasValidated(false);
  };
  const onCancel = () => {
    return Modal.confirm({
      title: isEdit
        ? formatMessage({
            id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.AreYouSureYouWant',
          }) //确认要取消编辑吗？
        : formatMessage({
            id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.AreYouSureYouWant.1',
          }), //确认要取消新建吗？
      onOk: () => {
        handleFormDrawerClose();
        formRef.resetFields();
        setHasValidated(false);
      },
      onCancel: () => {},
      okText: formatMessage({ id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Ok' }), //确定
      cancelText: formatMessage({
        id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Cancel',
      }), //取消
    });
  };
  useEffect(() => {
    if (isEdit) {
      const {
        name,
        enabled,
        pathIncludes,
        pathExcludes,
        type,
        maskingAlgorithmId,
        groovyScript,
        databaseRegexExpression = '',
        tableRegexExpression = '',
        columnRegexExpression = '',
        columnCommentRegexExpression = '',
        description = '',
      } = selectedRecord;
      const hasDatabaseRegexExpression = !!databaseRegexExpression;
      const hasTableRegexExpression = !!tableRegexExpression;
      const hasColumnRegexExpression = !!columnRegexExpression;
      const hasColumnCommentRegexExpression = !!columnCommentRegexExpression;
      setScript(groovyScript);
      formRef.setFieldsValue({
        name,
        enabled,
        pathIncludes,
        pathExcludes,
        type: SensitiveRuleType[type],
        groovyScript,
        regExp: {
          databaseRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.LibraryName',
            }), //库名
            checked: hasDatabaseRegexExpression ? ['databaseRegexExpression'] : [],
            regExp: databaseRegexExpression,
          },
          tableRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.TableName',
            }), //表名
            checked: hasTableRegexExpression ? ['tableRegexExpression'] : [],
            regExp: tableRegexExpression,
          },
          columnRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnName',
            }), //列名
            checked: hasColumnRegexExpression ? ['columnRegexExpression'] : [],
            regExp: columnRegexExpression,
          },
          columnCommentRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnRemarks',
            }), //列备注
            checked: hasColumnCommentRegexExpression ? ['columnCommentRegexExpression'] : [],
            regExp: columnCommentRegexExpression,
          },
        },
        maskingAlgorithmId: maskingAlgorithmId,
        description,
      });
    } else {
      setScript('');
      formRef.setFieldsValue({
        name: undefined,
        enabled: true,
        pathIncludes: '',
        pathExcludes: '',
        type: SensitiveRuleType.PATH,
        groovyScript: '',
        regExp: {
          databaseRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.LibraryName',
            }), //库名
            checked: [],
            regExp: '',
          },
          tableRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.TableName',
            }), //表名
            checked: [],
            regExp: '',
          },
          columnRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnName',
            }), //列名
            checked: [],
            regExp: '',
          },
          columnCommentRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnRemarks',
            }), //列备注
            checked: [],
            regExp: '',
          },
        },
        maskingAlgorithmId: undefined,
        description: '',
      });
    }
  }, [formDrawerVisible, isEdit, selectedRecord]);
  return (
    <Drawer
      open={formDrawerVisible}
      title={
        isEdit
          ? formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.EditIdentificationRules',
            }) //编辑识别规则
          : formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.CreateAnIdentificationRule',
            }) //新建识别规则
      }
      width={596}
      onClose={onCancel}
      destroyOnClose={true}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={onCancel}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Cancel',
                }) /*取消*/
              }
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {
                isEdit
                  ? formatMessage({
                      id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Submit',
                    }) //提交
                  : formatMessage({
                      id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Create',
                    }) //新建
              }
            </Button>
          </Space>
        </div>
      }
      className={styles.drawer}
    >
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <Form.Item
          label={
            formatMessage({ id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.RuleName' }) //规则名称
          }
          name={'name'}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.EnterARuleName',
              }), //请输入规则名称
            },
          ]}
        >
          <Input
            placeholder={formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.PleaseEnter',
            })} /*请输入*/
          />
        </Form.Item>
        <Form.Item
          label={
            formatMessage({ id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.RuleStatus' }) //规则状态
          }
          name={'enabled'}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.SelectARuleStatus',
              }), //请选择规则状态
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Enable',
                }) /*启用*/
              }
            </Radio>
            <Radio value={false}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Disable',
                }) /*停用*/
              }
            </Radio>
          </Radio.Group>
        </Form.Item>
        <DetectWay
          key="detectWay"
          {...{
            script,
            formRef,
            hasValidated,
            setScript,
            originType: isEdit ? SensitiveRuleType[selectedRecord.type] : undefined,
          }}
        />

        <Form.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.DesensitizationAlgorithm',
            }) //脱敏算法
          }
          name={'maskingAlgorithmId'}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id:
                  'odc.SensitiveRule.components.FormSensitiveRuleDrawer.SelectADesensitizationAlgorithm',
              }), //请选择脱敏算法
            },
          ]}
        >
          <Select
            placeholder={
              formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.PleaseSelect',
              }) //请选择
            }
            style={{
              width: '262px',
            }}
            optionLabelProp="label"
          >
            {sensitiveContext?.maskingAlgorithmOptions?.map((option, index) => {
              const target = sensitiveContext?.maskingAlgorithms?.find(
                (maskingAlgorithm) => maskingAlgorithm?.id === option?.value,
              );
              return (
                <Select.Option value={option?.value} key={index} label={option?.label}>
                  <PopoverContainer
                    key={index}
                    title={option?.label}
                    descriptionsData={[
                      {
                        label: '脱敏方式',
                        value: MaskRyleTypeMap?.[target?.type],
                      },
                      {
                        label: '测试数据',
                        value: target?.sampleContent,
                      },
                      {
                        label: '结果预览',
                        value: target?.maskedContent,
                      },
                    ]}
                    children={() => <div>{option?.label}</div>}
                  />
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.RuleDescription',
            }) //规则描述
          }
          name={'description'}
        >
          <Input.TextArea
            rows={4}
            placeholder={
              formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.PleaseEnter',
              }) //请输入
            }
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FormSensitiveRuleDrawer;
