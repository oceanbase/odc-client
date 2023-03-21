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
