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
import { Drawer } from 'antd';
import React from 'react';
import SQLLintResult from '.';
import { ISQLLintReuslt } from './type';

interface IProps {
  data: ISQLLintReuslt[];
  visible: boolean;
  closePage: () => void;
}

const LintDrawer: React.FC<IProps> = function ({ data, visible, closePage }) {
  return (
    <Drawer
      zIndex={1003}
      width={520}
      destroyOnClose
      open={visible}
      title={formatMessage({
        id: 'odc.component.SQLLintResult.Drawer.CheckResult',
      })} /*检查结果*/
      // footer={
      //   <Button style={{ float: 'right' }} type="primary">
      //     下载
      //   </Button>
      // }
      onClose={() => {
        closePage();
      }}
    >
      <SQLLintResult data={data} />
    </Drawer>
  );
};

export default LintDrawer;
