import { formatMessage } from '@/util/intl';
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

import {
  createRiskDetectRules,
  deleteRiskDetectRule,
  listRiskDetectRules,
  updateRiskDetectRule,
} from '@/common/network/riskDetectRule';
import { Acess, createPermission } from '@/component/Acess';
import Action from '@/component/Action';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { IConditionGroup } from '@/d.ts/riskDetectRule';
import { IRiskLevel } from '@/d.ts/riskLevel';
import tracert from '@/util/tracert';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Form, message, Space, Tooltip } from 'antd';
import useForm from 'antd/es/form/hooks/useForm';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Expression, SelectItemProps } from '../interface';
import Condition from './Condition';
import styles from './index.less';
import { initOptions } from './options';
import RiskLevelInfo from './RiskLevelInfo';
import RootNodeContent from './RootNodeContent';
import TreeTitle from './TreeTitle';
export type Operator = string;
export enum EBooleanOperator {
  AND = 'AND',
  OR = 'OR',
}
export const BooleanOperatorMap = {
  [EBooleanOperator.AND]: formatMessage({
    id: 'odc.src.page.Secure.RiskLevel.components.And',
    defaultMessage: '且',
  }), //'且'
  [EBooleanOperator.OR]: formatMessage({
    id: 'odc.src.page.Secure.RiskLevel.components.Or',
    defaultMessage: '或',
  }), //'或'
};
export enum EConditionType {
  CONDITION = 'CONDITION',
  CONDITION_GROUP = 'CONDITION_GROUP',
}
interface InnerRiskLevelProps {
  currentRiskLevel: IRiskLevel;
  memoryReload: () => void;
}
const InnerRiskLevel: React.FC<InnerRiskLevelProps> = ({ currentRiskLevel, memoryReload }) => {
  const domRef = useRef<any>();
  const [formRef] = useForm();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [rootNode, setRootNode] = useState<any>(null);
  const [rootBoolOperator, setRootBoolOperator] = useState<EBooleanOperator>(
    rootNode?.booleanOperator || EBooleanOperator.AND,
  );
  const [originRootNode, setOriginRootNode] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [empty, setEmpty] = useState<boolean>(true);
  const [environmentMap, setEnvironmentMap] = useState<{ [key in string | number]: string }>({});
  const [taskTypeIdMap, setTaskTypeIdMap] = useState<{ [key in string | number]: string }>({});
  const [sqlCheckResultIdMap, setSqlCheckResultIdMap] = useState<{
    [key in string | number]: string;
  }>({});
  const [environmentOptions, setEnvironmentOptions] = useState<SelectItemProps[]>([]);
  const [taskTypeOptions, setTaskTypeOptions] = useState<SelectItemProps[]>([]);
  const [sqlCheckResultOptions, setSqlCheckResultOptions] = useState<SelectItemProps[]>([]);
  const [showConditionGroup, setShowConditionGroup] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentRiskDetectRuleId, setCurrentRiskDetectRuleId] = useState<number>(null);
  const isDefaultLevel = currentRiskLevel?.level === 0;

  const handleCreateRiskDetectRule = async (rootNode): Promise<boolean> => {
    const res = await createRiskDetectRules({
      riskLevelId: currentRiskLevel?.id,
      riskLevel: currentRiskLevel,
      rootNode: rootNode,
    });
    return res;
  };
  const handleUpdateRiskDetectRule = async (id, rootNode): Promise<boolean> => {
    const res = await updateRiskDetectRule(id, {
      riskLevelId: currentRiskLevel?.id,
      riskLevel: currentRiskLevel,
      rootNode: rootNode,
    });
    return res;
  };
  const genRootNode = (rootNode) => {
    if (!rootNode) {
      return [];
    }
    setRootBoolOperator(rootNode?.booleanOperator || EBooleanOperator.AND);
    if (rootNode?.type === EConditionType.CONDITION) {
      setShowConditionGroup(false);
      return [rootNode];
    } else {
      // all ConditionGroup => { type: CG, children : (CG | C) [] }
      if (rootNode?.children?.length > 1) {
        // CG : { children: [CG | C, CG | C]}
        setShowConditionGroup(true);
        return rootNode?.children;
      } else {
        setShowConditionGroup(false);
        return [rootNode];
      }
    }
  };
  const parseRootNode = async (rootNode) => {
    const conditions = genRootNode(rootNode);
    await formRef.setFieldsValue({
      conditions: conditions,
    });
  };
  const initRootNode = async (envMap) => {
    if (currentRiskLevel) {
      const rd = await listRiskDetectRules({
        riskLevelId: currentRiskLevel?.id,
      });
      if (!!rd?.rootNode) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
      rd?.rootNode && setRootNode(transferIdToName(rd?.rootNode, envMap));
      rd?.rootNode &&
        setRootBoolOperator(
          (rd?.rootNode as IConditionGroup)?.booleanOperator || EBooleanOperator.AND,
        );
      rd?.rootNode && setOriginRootNode(rd?.rootNode);
      setCurrentRiskDetectRuleId(rd?.id);
      return rd?.rootNode;
    }
  };
  const initInnerRiskLevel = async () => {
    setLoading(true);
    const envMap = await initOptions({
      setEnvironmentMap,
      setEnvironmentOptions,
      setTaskTypeIdMap,
      setTaskTypeOptions,
      setSqlCheckResultIdMap,
      setSqlCheckResultOptions,
    });
    const rootNode = await initRootNode(envMap);
    parseRootNode(rootNode);
    formRef.resetFields();
    setLoading(false);
  };
  // 自定义环境为了方便拓展，需要将原来值为ENVIRONMENT_ID的expression修改为ENVIRONMENT_NAME。
  const transferIdToName = (root, envMap) => {
    if (root?.type === EConditionType.CONDITION) {
      if (root?.expression === Expression.ENVIRONMENT_ID) {
        root.expression = Expression.ENVIRONMENT_NAME;
        root.value = Array.isArray(root?.value)
          ? root?.value?.map((item) => envMap?.[` id:${item}`] || item)
          : envMap?.[` id:${root?.value}`] || root?.value;
      }
      return root;
    }
    if (root?.type === EConditionType.CONDITION_GROUP && root?.children?.length) {
      root.children = root?.children?.map((node) => transferIdToName(node, envMap));
      return root;
    }
    return root;
  };
  const handleSubmit = async () => {
    const formData = await formRef.validateFields()?.catch();
    const rawData = formData?.conditions;
    if (empty && Array.isArray(rawData) && rawData?.length === 0) {
      return;
    }
    let result;
    if (showConditionGroup) {
      result = {
        booleanOperator: rootBoolOperator || EBooleanOperator.AND,
        children: rawData,
        type: EConditionType.CONDITION_GROUP,
      };
    } else {
      result = rawData?.[0];
    }
    let reqFlag;
    tracert.click('a3112.b64008.c330924.d367479');
    if (empty && !currentRiskDetectRuleId) {
      reqFlag = await handleCreateRiskDetectRule(result);
    } else {
      reqFlag = await handleUpdateRiskDetectRule(currentRiskDetectRuleId, result);
    }
    if (reqFlag) {
      message.success(
        empty
          ? formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.NewAchievement',
              defaultMessage: '新建成功',
            }) //'新建成功'
          : formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.UpdateCompleted',
              defaultMessage: '更新成功',
            }), //'更新成功'
      );
      memoryReload();
      setOriginRootNode(null);
      setRootNode(null);
      await initRootNode(environmentMap);
      setIsEdit(false);
      formRef.resetFields();
    } else {
      message.error(
        empty
          ? formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.NewFailure',
              defaultMessage: '新建失败',
            }) //'新建失败'
          : formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.UpdateFailure',
              defaultMessage: '更新失败',
            }), //'更新失败'
      );
    }
    setRootBoolOperator(EBooleanOperator.AND);
  };
  const handleDelete = async (id: number) => {
    const result: boolean = await deleteRiskDetectRule(id);
    if (result) {
      message.success(
        formatMessage({
          id: 'odc.src.page.Secure.RiskLevel.components.SuccessfullyDeleted',
          defaultMessage: '删除成功',
        }), //'删除成功'
      );
      memoryReload();
      initRootNode(environmentMap);
      formRef.resetFields();
      setRootNode(null);
      setOriginRootNode(null);
      setRootBoolOperator(EBooleanOperator.AND);
      setCurrentRiskDetectRuleId(null);
    } else {
      message.error(
        formatMessage({
          id: 'odc.src.page.Secure.RiskLevel.components.FailedToDelete',
          defaultMessage: '删除失败',
        }), //'删除失败'
      );
    }
  };
  useEffect(() => {
    initInnerRiskLevel();
  }, []);
  useEffect(() => {
    if (isEdit) {
      parseRootNode(rootNode);
    }
  }, [isEdit]);
  return (
    <div className={styles.innerRiskLevel} key={currentRiskLevel?.id}>
      <RiskLevelInfo currentRiskLevel={currentRiskLevel} memoryReload={memoryReload} />
      <div className={styles.ruleContent}>
        <div className={styles.ruleDetail}>
          {
            formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.RiskRecognitionRules',
              defaultMessage: '风险识别规则',
            }) /* 
          风险识别规则
          */
          }

          <Tooltip
            trigger={'hover'}
            title={formatMessage({
              id: 'src.page.Secure.RiskLevel.components.6814586C',
              defaultMessage:
                '风险识别规则是通过表达式配置的规则，会决定工单的审批流程。\n如：「环境 等于 生产」将会匹配在「生产」环境中执行的工单，并执行对应的审批流程',
            })}
          >
            {' '}
            <QuestionCircleOutlined style={{ color: 'var(--text-color-hint)' }} />{' '}
          </Tooltip>
          <span> :</span>
        </div>
        {isEdit ? (
          <div>
            <Form form={formRef}>
              <div>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                  }}
                >
                  {showConditionGroup && (
                    <div
                      className={styles.title}
                      ref={domRef}
                      onMouseOver={() => setIsHover(true)}
                      onMouseLeave={() => setIsHover(false)}
                    >
                      <div
                        className={
                          isHover
                            ? rootBoolOperator === EBooleanOperator.AND
                              ? classnames(styles.left, styles.leftAnd)
                              : classnames(styles.left, styles.leftOr)
                            : styles.left
                        }
                      />

                      <div
                        className={
                          isHover
                            ? rootBoolOperator === EBooleanOperator.AND
                              ? classnames(styles.bo, styles.boAndHover)
                              : classnames(styles.bo, styles.boOrHover)
                            : rootBoolOperator === EBooleanOperator.AND
                            ? classnames(styles.bo, styles.boAnd)
                            : classnames(styles.bo, styles.boOr)
                        }
                        onClick={() => {
                          if (rootBoolOperator === EBooleanOperator.AND) {
                            setRootBoolOperator(EBooleanOperator.OR);
                          } else {
                            setRootBoolOperator(EBooleanOperator.AND);
                          }
                        }}
                      >
                        {BooleanOperatorMap?.[rootBoolOperator]}
                      </div>
                    </div>
                  )}

                  <div className={styles.conditions}>
                    <Form.List name={'conditions'}>
                      {(fields, { add, remove }) => {
                        return (
                          <>
                            {fields?.map((field, index) => {
                              const data = formRef.getFieldsValue();
                              if (
                                data?.conditions?.[index]?.type === EConditionType.CONDITION_GROUP
                              ) {
                                let booleanOperator = data?.conditions?.[index]?.booleanOperator;
                                const empty = data?.conditions?.[index]?.children?.length === 0;
                                return (
                                  <div className={styles.conditionGroupContent} key={index}>
                                    <div className={empty ? styles.treeEmpty : styles.tree}>
                                      <TreeTitle
                                        index={index}
                                        formRef={formRef}
                                        booleanOperator={booleanOperator}
                                        updateFields={(vdata) => {
                                          formRef.setFieldsValue(vdata);
                                        }}
                                        fieldName={[field.name, 'booleanOperator']}
                                      />

                                      <div>
                                        <Form.List name={[field.name, 'children']}>
                                          {(inFields, { add: inAdd, remove: inRemove }) => {
                                            return (
                                              <div className={styles.conditionItem} key={index}>
                                                {inFields?.map((inField, inIndex) => {
                                                  const key = `${inIndex}_${
                                                    formRef?.getFieldsValue()?.conditions?.[index]
                                                      ?.children?.[inIndex]?.expression
                                                  }`;
                                                  return (
                                                    <Condition
                                                      key={key}
                                                      indexChan={[index, inIndex]}
                                                      parentField={inField}
                                                      siblingSum={inFields?.length}
                                                      prevSiblingSum={fields?.length}
                                                      formRef={formRef}
                                                      remove={inRemove}
                                                      removeGroup={remove}
                                                      setShowConditionGroup={setShowConditionGroup}
                                                      environmentMap={taskTypeIdMap}
                                                      taskTypeIdMap={taskTypeIdMap}
                                                      sqlCheckResultIdMap={sqlCheckResultIdMap}
                                                      environmentOptions={environmentOptions}
                                                      taskTypeOptions={taskTypeOptions}
                                                      sqlCheckResultOptions={sqlCheckResultOptions}
                                                    />
                                                  );
                                                })}
                                                <div>
                                                  <Button
                                                    type="link"
                                                    onClick={() => {
                                                      inAdd({
                                                        type: EConditionType.CONDITION,
                                                        expression: undefined,
                                                        operator: undefined,
                                                        value: undefined,
                                                      });
                                                    }}
                                                  >
                                                    {
                                                      formatMessage({
                                                        id: 'odc.src.page.Secure.RiskLevel.components.AddConditions',
                                                        defaultMessage: '添加条件',
                                                      }) /* 
                                                  添加条件
                                                  */
                                                    }
                                                  </Button>
                                                </div>
                                              </div>
                                            );
                                          }}
                                        </Form.List>
                                      </div>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <Condition
                                    key={index}
                                    indexChan={[index]}
                                    parentField={field}
                                    siblingSum={fields?.length}
                                    prevSiblingSum={fields?.length}
                                    parentIsRoot={true}
                                    formRef={formRef}
                                    remove={remove}
                                    removeGroup={remove}
                                    setShowConditionGroup={setShowConditionGroup}
                                    environmentMap={taskTypeIdMap}
                                    taskTypeIdMap={taskTypeIdMap}
                                    sqlCheckResultIdMap={sqlCheckResultIdMap}
                                    environmentOptions={environmentOptions}
                                    taskTypeOptions={taskTypeOptions}
                                    sqlCheckResultOptions={sqlCheckResultOptions}
                                  />
                                );
                              }
                            })}
                            <Space
                              size={12}
                              className={styles.btnGroup}
                              style={
                                fields?.length === 0 && {
                                  padding: 0,
                                }
                              }
                            >
                              <Button
                                type="link"
                                onClick={async () => {
                                  add({
                                    type: EConditionType.CONDITION,
                                    expression: undefined,
                                    operator: undefined,
                                    value: undefined,
                                  });
                                  const raw = await formRef.getFieldsValue()?.conditions;
                                  if (raw?.length >= 2) {
                                    setShowConditionGroup(true);
                                  }
                                }}
                              >
                                {
                                  formatMessage({
                                    id: 'odc.src.page.Secure.RiskLevel.components.AddConditions.1',
                                    defaultMessage: '添加条件',
                                  }) /* 
                              添加条件
                              */
                                }
                              </Button>
                              <Button
                                type="link"
                                onClick={async () => {
                                  add({
                                    type: EConditionType.CONDITION_GROUP,
                                    children: [
                                      {
                                        type: EConditionType.CONDITION,
                                        expression: undefined,
                                        operator: undefined,
                                        value: undefined,
                                      },
                                    ],

                                    booleanOperator: EBooleanOperator.AND,
                                  });
                                  const raw = await formRef.getFieldsValue()?.conditions;
                                  if (raw?.length >= 2) {
                                    setShowConditionGroup(true);
                                  }
                                }}
                              >
                                {
                                  formatMessage({
                                    id: 'odc.src.page.Secure.RiskLevel.components.AddConditionGroup',
                                    defaultMessage: '添加条件组',
                                  }) /* 
                              添加条件组
                              */
                                }
                              </Button>
                            </Space>
                          </>
                        );
                      }}
                    </Form.List>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        ) : (
          <RootNodeContent
            key={currentRiskLevel?.id}
            empty={empty}
            rootNode={originRootNode}
            environmentMap={environmentMap}
            taskTypeIdMap={taskTypeIdMap}
            sqlCheckResultIdMap={sqlCheckResultIdMap}
            showActionButton={() => {
              return (
                <Acess {...createPermission(IManagerResourceType.risk_detect, actionTypes.create)}>
                  <Action.Button
                    disabled={isDefaultLevel}
                    type="primary"
                    onClick={async () => {
                      setIsEdit(true);
                      setShowConditionGroup(false);
                      tracert.click('a3112.b64008.c330924.d367478');
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.src.page.Secure.RiskLevel.components.NewRules',
                        defaultMessage: '新建规则',
                      }) //'新建规则'})
                    }
                  </Action.Button>
                </Acess>
              );
            }}
          />
        )}
      </div>
      <div>
        {isEdit ? (
          <Space size={12}>
            <Button type="primary" onClick={handleSubmit}>
              {
                empty
                  ? formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.Confirm',
                      defaultMessage: '确认',
                    }) //'确认'
                  : formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.Confirm.1',
                      defaultMessage: '确认',
                    }) //'确认'
              }
            </Button>
            <Button
              onClick={() => {
                setIsEdit(false);
                formRef.resetFields();
                setShowConditionGroup(false);
                setRootBoolOperator(originRootNode?.booleanOperator || EBooleanOperator.AND);
              }}
            >
              {
                empty
                  ? formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.Cancel',
                      defaultMessage: '取消',
                    }) //'取消'
                  : formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.Cancel.1',
                      defaultMessage: '取消',
                    }) //'取消'
              }
            </Button>
          </Space>
        ) : (
          <Action.Group>
            {!empty && (
              <Acess {...createPermission(IManagerResourceType.risk_detect, actionTypes.update)}>
                <Action.Button
                  disabled={isDefaultLevel}
                  onClick={async () => {
                    setIsEdit(true);
                    setShowConditionGroup(false);
                    tracert.click('a3112.b64008.c330924.d367478');
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.EditRules',
                      defaultMessage: '编辑规则',
                    }) //'编辑规则'
                  }
                </Action.Button>
              </Acess>
            )}

            {currentRiskDetectRuleId && (
              <Acess {...createPermission(IManagerResourceType.risk_detect, actionTypes.delete)}>
                <Action.Button
                  disabled={isDefaultLevel}
                  danger
                  onClick={() => handleDelete(currentRiskDetectRuleId)}
                >
                  {
                    formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.EmptyRules',
                      defaultMessage: '清空规则',
                    }) /* 
              清空规则
              */
                  }
                </Action.Button>
              </Acess>
            )}
          </Action.Group>
        )}
      </div>
    </div>
  );
};
export default InnerRiskLevel;
