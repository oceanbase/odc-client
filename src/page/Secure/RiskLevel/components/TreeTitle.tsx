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
