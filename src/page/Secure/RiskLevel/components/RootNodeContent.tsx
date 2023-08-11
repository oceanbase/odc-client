import { Empty, Space } from 'antd';
import styles from './index.less';
import { Expression, ExpressionMap, OperatorMap } from '../interface';
import { BooleanOperatorMap, EConditionType } from './InnerRiskLevel';

const RootNodeContent = ({
  empty,
  rootNode,
  environmentIdMap,
  taskTypeIdMap,
  sqlCheckResultIdMap,
}) => {
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
        <div className={styles.treeInputBorder}>{ExpressionMap?.[node?.expression]}</div>
        <div className={styles.treeInputBorder}>{OperatorMap?.[node?.operator]}</div>
        <div className={styles.treeInputBorder}>
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
          <div className={styles.treeScope}>
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
          description="暂无规则"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ flexGrow: 1 }}
        />
      ) : (
        <>{renderRootNodeTree(rootNode)}</>
      )}
    </div>
  );
};
export default RootNodeContent;
