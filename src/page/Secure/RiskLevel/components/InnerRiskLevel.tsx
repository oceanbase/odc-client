import { Button, Form, Space, message } from 'antd';
import RiskLevelInfo from './RiskLevelInfo';
import styles from './index.less';
import { useEffect, useRef, useState } from 'react';
import useForm from 'antd/es/form/hooks/useForm';
import classnames from 'classnames';
import _ from 'lodash';
import Condition from './Condition';
import { SelectItemProps } from '../interface';
import TreeTitle from './TreeTitle';
import {
  createRiskDetectRules,
  listRiskDetectRules,
  updateRiskDetectRule,
} from '@/common/network/riskDetectRule';
import { IRiskLevel } from '@/d.ts/riskLevel';
import RootNodeContent from './RootNodeContent';
import { getEnvironmentOptions, getSqlCheckResultOptions, getTaskTypeOptions } from './options';
import { IConditionGroup, RootNode } from '@/d.ts/riskDetectRule';
export type Operator = string;
export enum EBooleanOperator {
  AND = 'AND',
  OR = 'OR',
}
export const BooleanOperatorMap = {
  [EBooleanOperator.AND]: '和',
  [EBooleanOperator.OR]: '或',
};
export enum EConditionType {
  CONDITION = 'CONDITION',
  CONDITION_GROUP = 'CONDITION_GROUP',
}
export const data: RootNode = {
  booleanOperator: EBooleanOperator.AND,
  children: [],
  type: EConditionType.CONDITION_GROUP,
};
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
    rootNode?.booleanOperator,
  );
  const [originRootNode, setOriginRootNode] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [empty, setEmpty] = useState<boolean>(true);
  const [environmentIdMap, setEnvironmentIdMap] = useState<
    {
      [key in string | number]: string;
    }
  >({});
  const [taskTypeIdMap, setTaskTypeIdMap] = useState<
    {
      [key in string | number]: string;
    }
  >({});
  const [sqlCheckResultIdMap, setSqlCheckResultIdMap] = useState<
    {
      [key in string | number]: string;
    }
  >({});
  const [environmentOptions, setEnvironmentOptions] = useState<SelectItemProps[]>([]);
  const [taskTypeOptions, setTaskTypeOptions] = useState<SelectItemProps[]>([]);
  const [sqlCheckResultOptions, setSqlCheckResultOptions] = useState<SelectItemProps[]>([]);
  const [showConditionGroup, setShowConditionGroup] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentRiskDetectRuleId, setCurrentRiskDetectRuleId] = useState<number>(null);
  const initOptions = async () => {
    const envOptions = await getEnvironmentOptions();
    const envIdMap = {};
    envOptions?.forEach(({ value, label }) => (envIdMap[value] = label));
    setEnvironmentIdMap(envIdMap);
    setEnvironmentOptions(envOptions);

    const taskTypeOptions = await getTaskTypeOptions();
    const taskTypeIdMap = {};
    taskTypeOptions?.forEach(({ label, value }) => (taskTypeIdMap[value] = label));
    setTaskTypeIdMap(taskTypeIdMap);
    setTaskTypeOptions(taskTypeOptions);

    const sqlCheckResultOptions = await getSqlCheckResultOptions();
    const sqlChekcResultMap = {};
    sqlCheckResultOptions?.forEach(({ label, value }) => (sqlChekcResultMap['' + value] = label));
    setSqlCheckResultIdMap(sqlChekcResultMap);
    setSqlCheckResultOptions(sqlCheckResultOptions);
  };
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
    if (rootNode?.type === EConditionType.CONDITION) {
      setShowConditionGroup(false);
      return [rootNode];
    } else {
      // all ConditionGroup => { type: CG, children : (CG | C) [] }
      setRootBoolOperator(rootNode?.booleanOpretor || EBooleanOperator.AND);
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
    console.log(conditions);
    await formRef.setFieldsValue({
      conditionGroup1: conditions,
    });
  };
  const initRootNode = async () => {
    if (currentRiskLevel) {
      const rd = await listRiskDetectRules({
        riskLevelId: currentRiskLevel?.id,
      });
      if (!!rd?.rootNode) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
      rd?.rootNode && setRootNode(rd?.rootNode);
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
    await initOptions();
    const rootNode = await initRootNode();
    parseRootNode(rootNode);
    formRef.resetFields();
    setLoading(false);
  };

  const handleSubmit = async () => {
    const formData = await formRef.validateFields()?.catch();
    const rawData = formData?.conditionGroup1;
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
    if (empty) {
      reqFlag = await handleCreateRiskDetectRule(result);
    } else {
      reqFlag = await handleUpdateRiskDetectRule(currentRiskDetectRuleId, result);
    }
    if (reqFlag) {
      message.success(empty ? '新建成功' : '更新成功');
      await initRootNode();
      setIsEdit(false);
      formRef.resetFields();
    } else {
      message.error(empty ? '更新失败' : '更新失败');
    }
    setRootBoolOperator(EBooleanOperator.AND);
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
    <div
      style={{
        height: '100%',
        padding: '12px 0px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      key={currentRiskLevel?.id}
    >
      <RiskLevelInfo currentRiskLevel={currentRiskLevel} memoryReload={memoryReload} />
      <div>
        <div
          style={{
            marginBottom: '8px',
            color: 'var(--text-color-primary)',
          }}
        >
          风险识别规则
          <span> :</span>
        </div>
        {isEdit ? (
          <div>
            <Form form={formRef}>
              <div>
                <div style={{ position: 'relative', display: 'flex' }}>
                  {showConditionGroup && (
                    <div
                      className={styles.title}
                      ref={domRef}
                      onMouseOver={() => setIsHover(true)}
                      onMouseLeave={() => setIsHover(false)}
                    >
                      <div
                        className={styles.left}
                        style={{
                          borderColor: isHover ? 'green' : 'black',
                        }}
                      />
                      <div
                        className={classnames(styles.bo, styles.boHover)}
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
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    <Form.List name={'conditionGroup1'}>
                      {(fields, { add, remove }) => {
                        return (
                          <>
                            {fields?.map((field, index) => {
                              const data = formRef.getFieldsValue();
                              if (
                                data?.conditionGroup1?.[index]?.type ===
                                EConditionType.CONDITION_GROUP
                              ) {
                                let booleanOperator =
                                  data?.conditionGroup1?.[index]?.booleanOperator;
                                const empty =
                                  data?.conditionGroup1?.[index]?.children?.length === 0;
                                return (
                                  <div
                                    style={{ display: 'flex', flexDirection: 'column' }}
                                    key={index}
                                  >
                                    <div
                                      style={
                                        empty
                                          ? {
                                              display: 'flex',
                                              position: 'relative',
                                              alignItems: 'center',
                                            }
                                          : { display: 'flex', position: 'relative' }
                                      }
                                    >
                                      <div className={styles.title}>
                                        <div className={styles.left} />
                                        <TreeTitle
                                          index={index}
                                          formRef={formRef}
                                          booleanOperator={booleanOperator}
                                          updateFields={(vdata) => {
                                            formRef.setFieldsValue(vdata);
                                          }}
                                          fieldName={[field.name, 'booleanOperator']}
                                        />
                                      </div>
                                      <div>
                                        <Form.List name={[field.name, 'children']}>
                                          {(inFields, { add: inAdd, remove: inRemove }) => {
                                            return (
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: '8px',
                                                }}
                                                key={index}
                                              >
                                                {inFields?.map((inField, inIndex) => (
                                                  <Condition
                                                    key={inIndex}
                                                    indexChan={[index, inIndex]}
                                                    parentField={inField}
                                                    siblingSum={inFields?.length}
                                                    prevSiblingSum={fields?.length}
                                                    formRef={formRef}
                                                    remove={inRemove}
                                                    removeGroup={remove}
                                                    setShowConditionGroup={setShowConditionGroup}
                                                    environmentIdMap={taskTypeIdMap}
                                                    taskTypeIdMap={taskTypeIdMap}
                                                    sqlCheckResultIdMap={sqlCheckResultIdMap}
                                                    environmentOptions={environmentOptions}
                                                    taskTypeOptions={taskTypeOptions}
                                                    sqlCheckResultOptions={sqlCheckResultOptions}
                                                  />
                                                ))}

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
                                                    添加规则
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
                                    environmentIdMap={taskTypeIdMap}
                                    taskTypeIdMap={taskTypeIdMap}
                                    sqlCheckResultIdMap={sqlCheckResultIdMap}
                                    environmentOptions={environmentOptions}
                                    taskTypeOptions={taskTypeOptions}
                                    sqlCheckResultOptions={sqlCheckResultOptions}
                                  />
                                );
                              }
                            })}
                            <Space>
                              <Button
                                type="link"
                                onClick={async () => {
                                  add({
                                    type: EConditionType.CONDITION,
                                    expression: undefined,
                                    operator: undefined,
                                    value: undefined,
                                  });
                                  const raw = await formRef.getFieldsValue()?.conditionGroup1;
                                  if (raw?.length === 2) {
                                    if (raw.every((d) => d?.type === EConditionType.CONDITION)) {
                                      formRef.setFieldsValue({
                                        conditionGroup1: [
                                          {
                                            type: EConditionType.CONDITION_GROUP,
                                            children: raw,
                                            booleanOperator: EBooleanOperator.AND,
                                          },
                                        ],
                                      });
                                    } else {
                                      if (!showConditionGroup) {
                                        setShowConditionGroup(true);
                                        setRootBoolOperator(EBooleanOperator.AND);
                                      }
                                    }
                                  }
                                }}
                              >
                                添加规则
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
                                  const raw = await formRef.getFieldsValue()?.conditionGroup1;
                                  if (raw?.length >= 2) {
                                    if (!showConditionGroup) {
                                      setShowConditionGroup(true);
                                      setRootBoolOperator(EBooleanOperator.AND);
                                    }
                                  }
                                }}
                              >
                                添加规则组
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
            environmentIdMap={environmentIdMap}
            taskTypeIdMap={taskTypeIdMap}
            sqlCheckResultIdMap={sqlCheckResultIdMap}
          />
        )}
      </div>
      <div>
        {isEdit ? (
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              {empty ? '确认新建' : '确认修改'}
            </Button>
            <Button
              onClick={() => {
                setIsEdit(false);
                formRef.resetFields();
              }}
            >
              {empty ? '取消新建' : '取消修改'}
            </Button>
          </Space>
        ) : (
          <Button
            onClick={() => {
              setIsEdit(true);
            }}
          >
            {empty ? '新建规则' : '编辑规则'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InnerRiskLevel;
