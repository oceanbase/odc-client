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
      visible={visible}
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
