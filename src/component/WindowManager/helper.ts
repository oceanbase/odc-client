import { IPage, PageType } from '@/d.ts';
import { generatePageTitle } from '@/store/helper/pageKeyGenerate';
import { formatMessage } from '@/util/intl';

const titleText = {
  [PageType.SESSION_MANAGEMENT]: formatMessage({
    id: 'workspace.header.session.management',
  }),
  [PageType.SESSION_PARAM]: formatMessage({
    id: 'workspace.header.session.params',
  }),
  [PageType.RECYCLE_BIN]: formatMessage({
    id: 'workspace.header.recycle',
  }),
  [PageType.CREATE_TABLE]:
    formatMessage({
      id: 'workspace.header.create',
    }) +
    formatMessage({
      id: 'workspace.header.create.table',
    }),
  [PageType.CREATE_VIEW]: formatMessage({ id: 'workspace.window.createView.modal.title' }),
  [PageType.CREATE_FUNCTION]: formatMessage({
    id: 'workspace.window.createFunction.modal.title',
  }),
  [PageType.CREATE_PROCEDURE]: formatMessage({
    id: 'workspace.window.createProcedure.modal.title',
  }),
  [PageType.CREATE_TRIGGER]: formatMessage({ id: 'odc.helper.page.openPage.CreateATrigger' }),
  [PageType.CREATE_TYPE]: formatMessage({ id: 'odc.helper.page.openPage.NewType' }),
  [PageType.CREATE_SEQUENCE]: formatMessage({
    id: 'workspace.window.createSequence.modal.title',
  }),
  [PageType.CREATE_SYNONYM]: formatMessage({ id: 'odc.helper.page.openPage.CreateSynonym' }),
  [PageType.TASKS]: formatMessage({
    id: 'odc.component.TaskPopover.TaskCenter',
  }),
};

export function getPageTitleText(page: IPage) {
  const { type, title, params, key } = page;
  const simpleTitle = titleText[type];
  if (simpleTitle) {
    return simpleTitle;
  }
  switch (type) {
    case PageType.CREATE_PACKAGE: {
      if (params?.isPackageBody) {
        return formatMessage({
          id: 'workspace.window.createPackageBody.modal.title',
        });
      }
      return formatMessage({
        id: 'workspace.window.createPackage.modal.title',
      });
    }
    case PageType.OB_CLIENT: {
      return formatMessage({ id: 'odc.helper.page.openPage.CommandLineWindow' }) + params.index;
    }
    case PageType.SQL: {
      if (params?.scriptId) {
        return title;
      }
      return generatePageTitle(PageType.SQL, key);
    }
    case PageType.PL: {
      if ((params.isAnonymous && !params?.scriptId) || params.isDebug) {
        return generatePageTitle(PageType.PL, key);
      }
      return title;
    }
    case PageType.BATCH_COMPILE_FUNCTION:
    case PageType.BATCH_COMPILE_PACKAGE:
    case PageType.BATCH_COMPILE_PROCEDURE:
    case PageType.BATCH_COMPILE_TRIGGER:
    case PageType.BATCH_COMPILE_TYPE: {
      return generatePageTitle(type, key);
    }
    default: {
      return title;
    }
  }
}
