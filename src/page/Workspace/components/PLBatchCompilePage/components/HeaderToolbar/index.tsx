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

import Toolbar from '@/component/Toolbar';
import CompileAllSvg from '@/svgr/batch-compile-all.svg';
import CompileSvg from '@/svgr/batch-compile.svg';
import { formatMessage } from '@/util/intl';
import Icon, { BorderOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import React from 'react';
import { CompileStatus, CompileType } from '../../index';

const ToolbarButton = Toolbar.Button;

const HeaderToolbar: React.FC<{
  status: CompileStatus;
  handleCompile: (type: CompileType) => void;
  handleCancelCompile: () => void;
}> = (props) => {
  const { status, handleCompile, handleCancelCompile } = props;

  const handleConfirmCancel = () => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.PLBatchCompilePage.AreYouSureYouWant',
      }), //正在编译中，确定终止编译吗？
      okText: formatMessage({
        id: 'app.button.ok',
      }),
      cancelText: formatMessage({
        id: 'app.button.cancel',
      }),
      icon: <QuestionCircleFilled />,
      centered: true,
      onOk: () => {
        handleCancelCompile();
      },
    });
  };

  return (
    <Toolbar>
      <ToolbarButton
        isShowText
        text={formatMessage({
          id: 'odc.components.HeaderToolbar.CompileAllObjects',
        })} /*编译全部对象*/
        disabled={status === CompileStatus.RUNNING}
        icon={<Icon component={CompileAllSvg} />}
        onClick={() => {
          handleCompile(CompileType.ALL);
        }}
      />

      <ToolbarButton
        isShowText
        text={formatMessage({
          id: 'odc.components.HeaderToolbar.CompileInvalidObjects',
        })} /*编译无效对象*/
        disabled={status === CompileStatus.RUNNING}
        icon={<Icon component={CompileSvg} />}
        onClick={() => {
          handleCompile(CompileType.INVALID);
        }}
      />

      <ToolbarButton
        isShowText
        text={formatMessage({
          id: 'odc.components.HeaderToolbar.Termination',
        })} /*终止*/
        disabled={status !== CompileStatus.RUNNING}
        icon={<BorderOutlined />}
        onClick={handleConfirmCancel}
      />
    </Toolbar>
  );
};

export default HeaderToolbar;
