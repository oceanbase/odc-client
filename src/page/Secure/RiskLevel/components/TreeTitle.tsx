import classnames from "classnames";
import styles from './index.less';
import { useState } from "react";
import _ from "lodash";
import { Form, Input } from "antd";
import { BooleanOperatorMap, EBooleanOperator } from "./InnerRiskLevel";

const TreeTitle = ({
  formRef,
  booleanOperator,
  index,
  fieldName,
  updateFields,
}
) => {
  const [localBooleanOperator, setlocalBooleanOperator] = useState<EBooleanOperator>(booleanOperator);
  return (

    <div className={classnames(styles.bo, styles.boHover)} onClick={async () => {
      let rawData = await formRef.getFieldsValue();
      if (localBooleanOperator === EBooleanOperator.AND) {
        rawData.conditionGroup1[index].booleanOperator = EBooleanOperator.OR;
        setlocalBooleanOperator(EBooleanOperator.OR);
      } else {
        rawData.conditionGroup1[index].booleanOperator = EBooleanOperator.AND;
        setlocalBooleanOperator(EBooleanOperator.AND);
      }
      updateFields(rawData);
    }}>

      {BooleanOperatorMap?.[localBooleanOperator]}
      <Form.Item name={fieldName} shouldUpdate>
        <Input type="hidden" value={localBooleanOperator}
        />
      </Form.Item>
    </div>
  )
}
export default TreeTitle;
