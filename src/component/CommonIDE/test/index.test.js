import { formatMessage } from '@/util/intl';
jest.mock('@alipay/ob-editor-react', () => {
  return () => {
    return (
      <div className="monaco-editor" data-testid="monaco-editor">
        1
      </div>
    );
  };
});
import React from 'react';
import { queryByTestId, render } from '@testing-library/react';
import { Provider } from 'mobx-react';
import settingStore from '@/store/setting';
import menuStore from '@/store/menu';
import pageStore from '@/store/page';
import sqlStore from '@/store/sql';
import connectionStore from '@/store/connection';
import userStore from '@/store/login';
import schemaStore from '@/store/schema';
import commonStore from '@/store/common';
import modalStore from '@/store/modal';
import taskStore from '@/store/task';
import CommonIDE from '..';
describe('commonIDE', () => {
  it(
    formatMessage({ id: 'odc.CommonIDE.test.index.test.BasicRendering' }), //基础渲染
    () => {
      const instance = render(
        <Provider
          menuStore={menuStore}
          settingStore={settingStore}
          pageStore={pageStore}
          sqlStore={sqlStore}
          connectionStore={connectionStore}
          userStore={userStore}
          schemaStore={schemaStore}
          commonStore={commonStore}
          modalStore={modalStore}
          taskStore={taskStore}
        >
          <CommonIDE
            language="sql-oceanbase-mysql"
            initialSQL="select from a;"
            log={<div data-testid="test1">aa</div>}
            toolbarActions={<a data-testid="toolbarActions">btn</a>}
          />
        </Provider>,
      );
      const logDom = queryByTestId(instance.container, 'test1');
      console.log(instance.container.innerHTML);
      expect(logDom).not.toBeNull();
      expect(logDom.textContent).toBe('aa');
      expect(instance.container.querySelector('.monaco-editor')).not.toBeNull();
      expect(instance.container.querySelector('.monaco-editor')).not.toBeNull();
      expect(queryByTestId(instance.container, 'toolbarActions').textContent).toBe('btn');
    },
  );
});
