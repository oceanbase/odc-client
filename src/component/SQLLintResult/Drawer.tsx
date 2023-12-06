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

import { formatMessage } from '@/util/intl';
import { Button, Drawer, Space } from 'antd';
import React from 'react';
import { ISQLLintReuslt } from './type';
import LintResultTable from '@/page/Workspace/components/SQLResultSet/LintResultTable';
interface IProps {
  data: ISQLLintReuslt[];
  visible: boolean;
  closePage: () => void;
}
const LintDrawer: React.FC<IProps> = function ({ data, visible, closePage }) {
  return (
    <Drawer
      zIndex={1003}
      width={832}
      destroyOnClose
      open={visible}
      title={formatMessage({
        id: 'odc.component.SQLLintResult.Drawer.CheckResult',
      })}
      /*检查结果*/ footer={
        <Space
          style={{
            float: 'right',
          }}
        >
          <Button onClick={closePage}>
            {formatMessage({ id: 'odc.src.component.SQLLintResult.Closure' }) /* 关闭 */}
          </Button>
        </Space>
      }
      onClose={() => {
        closePage();
      }}
    >
      <LintResultTable hasExtraOpt={false} showLocate={false} lintResultSet={data} />
    </Drawer>
  );
};
export default LintDrawer;
