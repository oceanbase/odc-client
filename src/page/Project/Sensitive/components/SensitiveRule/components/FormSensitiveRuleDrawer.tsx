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
import { maskRuleTypeMap } from '@/page/Secure/MaskingAlgorithm';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Form, Input, message, Modal, Radio, Select, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useContext, useEffect, useState } from 'react';
import ProjectContext from '../../../../ProjectContext';
import SensitiveContext from '../../../SensitiveContext';
import { PopoverContainer } from '../../SensitiveColumn';
import DetectWay from './DetectWay';
import styles from './index.less';
const FormSensitiveRuleDrawer = ({
  formDrawerVisible,
  handleFormDrawerClose,
  isEdit,
  selectedRecord,
  projectId,
}) => {
  const [formRef] = useForm();
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [script, setScript] = useState<string>('');
  const [hasValidated, setHasValidated] = useState<boolean>(false);
  const [currentType, setCurrentType] = useState(SensitiveRuleType.PATH);
  const handleSubmit = async () => {
    try {
      const rawData = await formRef.validateFields();
      const { enabled, maskingAlgorithmId, name, type, regExp = {}, description } = rawData;
      if (type === SensitiveRuleType.GROOVY && script?.length === 0) {
        setHasValidated(true);
        return;
      }
      let data: Partial<ISensitiveRule> = {
        enabled,
        name,
        type,
        projectId: projectId,
        description,
      };

      // 在编辑模式下，保留原有记录的所有字段
      if (isEdit && selectedRecord) {
        data = {
          ...selectedRecord, // 保留原有字段
          enabled,
          name,
          type,
          description,
          // 清空其他类型的字段，避免冲突
          pathIncludes: [],
          pathExcludes: [],
          databaseRegexExpression: '',
          tableRegexExpression: '',
          columnRegexExpression: '',
          columnCommentRegexExpression: '',
          groovyScript: '',
          aiSensitiveTypes: [],
          aiCustomPrompt: '',
        };
      }

      // AI类型使用默认脱敏算法
      if (type === SensitiveRuleType.AI) {
        // 为AI类型设置默认脱敏算法（取第一个可用的算法）
        const defaultValue = sensitiveContext?.maskingAlgorithmOptions?.[0]?.value;
        data.maskingAlgorithmId = defaultValue ? Number(defaultValue) : null;
      } else {
        data.maskingAlgorithmId = maskingAlgorithmId;
      }
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
        case SensitiveRuleType.AI: {
          data = {
            ...data,
            aiSensitiveTypes: rawData.aiSensitiveTypes || [],
            aiCustomPrompt: rawData.aiCustomPrompt || '',
          };
          break;
        }
      }
      if (isEdit) {
        console.log('提交编辑数据:', {
          projectId,
          selectedRecordId: selectedRecord.id,
          data,
        });

        const result = await updateSensitiveRule(
          projectId,
          selectedRecord.id,
          data as ISensitiveRule,
        );

        console.log('API调用结果:', result);

        if (result) {
          message.success(
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.UpdatedSuccessfully',
              defaultMessage: '更新成功',
            }), //更新成功
          );

          handleFormDrawerClose(formRef.resetFields);
        } else {
          message.error(
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.UpdateFailed',
              defaultMessage: '更新失败',
            }), //更新失败
          );
        }
      } else {
        const result = await createSensitiveRule(projectId, data);
        if (result) {
          message.success(
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.New',
              defaultMessage: '新建成功',
            }), //新建成功
          );

          handleFormDrawerClose();
        } else {
          message.error(
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.FailedToCreate',
              defaultMessage: '新建失败',
            }), //新建失败
          );
        }
      }

      setHasValidated(false);
    } catch (error) {
      console.error('表单验证或提交失败:', error);
      // 如果是表单验证失败，不显示错误消息，让表单自己处理
      // 如果是其他错误，可以在这里处理
    }
  };
  const onCancel = () => {
    return Modal.confirm({
      title: isEdit
        ? formatMessage({
            id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.AreYouSureYouWant',
            defaultMessage: '是否确认取消编辑？',
          }) //确认要取消编辑吗？
        : formatMessage({
            id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.AreYouSureYouWant.1',
            defaultMessage: '是否确认取消新建？',
          }),
      //确认要取消新建吗？
      onOk: () => {
        handleFormDrawerClose();
        formRef.resetFields();
        setHasValidated(false);
      },
      onCancel: () => {},
      okText: formatMessage({
        id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Ok',
        defaultMessage: '确定',
      }),
      //确定
      cancelText: formatMessage({
        id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Cancel',
        defaultMessage: '取消',
      }), //取消
    });
  };

  useEffect(() => {
    if (!formDrawerVisible) {
      return;
    }

    if (isEdit && selectedRecord) {
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
        aiSensitiveTypes = [],
        aiCustomPrompt = '',
      } = selectedRecord;
      const hasDatabaseRegexExpression = !!databaseRegexExpression;
      const hasTableRegexExpression = !!tableRegexExpression;
      const hasColumnRegexExpression = !!columnRegexExpression;
      const hasColumnCommentRegexExpression = !!columnCommentRegexExpression;
      setScript(groovyScript || '');
      setCurrentType(SensitiveRuleType[type]);
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
              defaultMessage: '库名',
            }),
            //库名
            checked: hasDatabaseRegexExpression ? ['databaseRegexExpression'] : [],
            regExp: databaseRegexExpression,
          },
          tableRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.TableName',
              defaultMessage: '表名',
            }),
            //表名
            checked: hasTableRegexExpression ? ['tableRegexExpression'] : [],
            regExp: tableRegexExpression,
          },
          columnRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnName',
              defaultMessage: '列名',
            }),
            //列名
            checked: hasColumnRegexExpression ? ['columnRegexExpression'] : [],
            regExp: columnRegexExpression,
          },
          columnCommentRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnRemarks',
              defaultMessage: '列备注',
            }),
            //列备注
            checked: hasColumnCommentRegexExpression ? ['columnCommentRegexExpression'] : [],
            regExp: columnCommentRegexExpression,
          },
        },
        maskingAlgorithmId: maskingAlgorithmId,
        description,
        aiSensitiveTypes,
        aiCustomPrompt,
      });
    } else if (!isEdit) {
      // 新建模式下重置表单
      setScript('');
      setCurrentType(SensitiveRuleType.PATH);
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
              defaultMessage: '库名',
            }),
            //库名
            checked: [],
            regExp: '',
          },
          tableRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.TableName',
              defaultMessage: '表名',
            }),
            //表名
            checked: [],
            regExp: '',
          },
          columnRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnName',
              defaultMessage: '列名',
            }),
            //列名
            checked: [],
            regExp: '',
          },
          columnCommentRegexExpression: {
            label: formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.ColumnRemarks',
              defaultMessage: '列备注',
            }),
            //列备注
            checked: [],
            regExp: '',
          },
        },
        maskingAlgorithmId: undefined,
        description: '',
        aiSensitiveTypes: [],
        aiCustomPrompt: '',
      });
    }
  }, [isEdit, selectedRecord, formDrawerVisible]);
  return (
    <Drawer
      open={formDrawerVisible}
      title={
        isEdit
          ? formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.EditIdentificationRules',
              defaultMessage: '编辑识别规则',
            }) //编辑识别规则
          : formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.CreateAnIdentificationRule',
              defaultMessage: '新建识别规则',
            }) //新建识别规则
      }
      width={596}
      onClose={onCancel}
      destroyOnClose={true}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Space>
            <Button onClick={onCancel}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Cancel',
                  defaultMessage: '取消',
                }) /*取消*/
              }
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {
                isEdit
                  ? formatMessage({
                      id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Submit',
                      defaultMessage: '提交',
                    }) //提交
                  : formatMessage({
                      id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Create',
                      defaultMessage: '新建',
                    }) //新建
              }
            </Button>
          </Space>
        </div>
      }
      rootClassName={styles.drawer}
    >
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <Form.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.RuleName',
              defaultMessage: '规则名称',
            }) //规则名称
          }
          name={'name'}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.EnterARuleName',
                defaultMessage: '请输入规则名称',
              }), //请输入规则名称
            },
          ]}
        >
          <Input
            placeholder={formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.PleaseEnter',
              defaultMessage: '请输入',
            })} /*请输入*/
          />
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.RuleStatus',
              defaultMessage: '规则状态',
            }) //规则状态
          }
          name={'enabled'}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.SelectARuleStatus',
                defaultMessage: '请选择规则状态',
              }), //请选择规则状态
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Enable',
                  defaultMessage: '启用',
                }) /*启用*/
              }
            </Radio>
            <Radio value={false}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.Disable',
                  defaultMessage: '停用',
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
            onTypeChange: setCurrentType,
          }}
        />

        {currentType !== SensitiveRuleType.AI && (
          <Form.Item
            label={
              formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.DesensitizationAlgorithm',
                defaultMessage: '脱敏算法',
              }) //脱敏算法
            }
            name={'maskingAlgorithmId'}
            required
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.SelectADesensitizationAlgorithm',
                  defaultMessage: '请选择脱敏算法',
                }), //请选择脱敏算法
              },
            ]}
          >
            <Select
              placeholder={
                formatMessage({
                  id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.PleaseSelect',
                  defaultMessage: '请选择',
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
                          label: formatMessage({
                            id: 'odc.src.page.Project.Sensitive.components.SensitiveRule.components.DesensitizationMethod',
                            defaultMessage: '脱敏方式',
                          }), //'脱敏方式'
                          value: maskRuleTypeMap?.[target?.type],
                        },
                        {
                          label: formatMessage({
                            id: 'odc.src.page.Project.Sensitive.components.SensitiveRule.components.TestData',
                            defaultMessage: '测试数据',
                          }), //'测试数据'
                          value: target?.sampleContent,
                        },
                        {
                          label: formatMessage({
                            id: 'odc.src.page.Project.Sensitive.components.SensitiveRule.components.Preview',
                            defaultMessage: '结果预览',
                          }), //'结果预览'
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
        )}
        <Form.Item
          label={
            formatMessage({
              id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.RuleDescription',
              defaultMessage: '规则描述',
            }) //规则描述
          }
          name={'description'}
        >
          <Input.TextArea
            rows={4}
            placeholder={
              formatMessage({
                id: 'odc.SensitiveRule.components.FormSensitiveRuleDrawer.PleaseEnter',
                defaultMessage: '请输入',
              }) //请输入
            }
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default FormSensitiveRuleDrawer;
