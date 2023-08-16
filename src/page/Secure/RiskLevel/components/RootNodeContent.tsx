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

import { Empty, Space } from 'antd';
import styles from './index.less';
import { Expression, ExpressionMap, OperatorMap } from '../interface';
import { BooleanOperatorMap, EBooleanOperator, EConditionType } from './InnerRiskLevel';
import classNames from 'classnames';
import { useState } from 'react';
const RootNodeContent = ({
  empty,
  rootNode,
  environmentIdMap,
  taskTypeIdMap,
  sqlCheckResultIdMap,
}) => {
  const [isHover, setIsHover] = useState<boolean>(false);
  const getValueMapByExpression = (expression: Expression): { [key in string]: string } => {
    let valueMap;
    switch (expression) {
      case Expression.ENVIRONMENT_ID: {
        valueMap = environmentIdMap;
        break;
      }
      case Expression.TASK_TYPE: {
        valueMap = taskTypeIdMap;
        break;
      }
      case Expression.SQL_CHECK_RESULT: {
        valueMap = sqlCheckResultIdMap;
        break;
      }
      case Expression.PROJECT_NAME: {
        valueMap = {};
        break;
      }
      case Expression.DATABASE_NAME: {
        valueMap = {};
        break;
      }
      default: {
        valueMap = {};
        break;
      }
    }
    return valueMap;
  };
  const renderNode = (node) => {
    const valueMap = getValueMapByExpression(node?.expression);
    return (
      <Space size={12}>
        <div className={styles.treeInputBorder} key={1}>
          {ExpressionMap?.[node?.expression]}
        </div>
        <div className={styles.treeInputBorder} key={2}>
          {OperatorMap?.[node?.operator]}
        </div>
        <div className={styles.treeInputBorder} key={3}>
          {Array.isArray(node?.value)
            ? node?.value?.map((v) => valueMap?.[v] || v)?.join(', ')
            : valueMap?.[node?.value] || node?.value}
        </div>
      </Space>
    );
  };
  const renderRootNodeTree = (node) => {
    if (node?.type === EConditionType.CONDITION) {
      return <div className={styles.treeScopeContainer}>{renderNode(node)}</div>;
    } else {
      return (
        <div className={styles.treeScopeContainer}>
          <div
            className={styles.treeScope}
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <div className={styles.treeScopeBorder} />
            <div className={styles.treeScopeTitle}>
              {BooleanOperatorMap?.[node?.booleanOperator]}
            </div>
          </div>
          <div className={styles.treeScopeNode}>
            {node?.children?.map((child) => {
              return <>{renderRootNodeTree(child)}</>;
            })}
          </div>
        </div>
      );
    }
  };
  return (
    <div className={empty ? styles.rootNodeContentEmpty : styles.rootNodeContent}>
      {empty ? (
        <Empty
          description={
            formatMessage({ id: 'odc.src.page.Secure.RiskLevel.components.NoRule' }) /* 暂无规则 */
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            flexGrow: 1,
          }}
        />
      ) : (
        <>{renderRootNodeTree(rootNode)}</>
      )}
    </div>
  );
};
export default RootNodeContent;
