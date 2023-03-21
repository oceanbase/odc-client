import { IConnectionType } from '@/d.ts';
import commonStore from '@/store/common';
import connection from '@/store/connection';
import { openTutorialPage } from '@/store/helper/page';
import { default as page, default as pageStore } from '@/store/page';
import schema from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { history } from 'umi';

export interface ITutorialAction {
  action: 'openTutorial';
  data: ITutorialData;
}

export interface ITutorialData {
  tutorialId: string;
}

/**
 * 进入第一个连接，并且打开OB教程
 */
export const action = async (actionData: ITutorialAction) => {
  const { data } = actionData;
  const connectionList = await connection.getList({
    page: 1,
    size: 1,
    visibleScope: IConnectionType.ORGANIZATION,
  });

  const firstConnection = connectionList?.contents?.[0];
  if (!firstConnection) {
    return formatMessage({
      id: 'odc.page.Gateway.tutorial.FailedToInitializeTheConnection',
    }); //初始化连接失败
  }
  let sessionId;
  try {
    sessionId = await connection.connect(firstConnection.id?.toString(), null, null, true);
  } catch (e) {
    if (e) {
      return e.message;
    }
  }

  if (sessionId) {
    const isSuccess = await connection.get(sessionId);

    if (isSuccess) {
      if (connection.connection.defaultDBName) {
        schema.database = {
          name: connection.connection.defaultDBName,
        };
      }
      commonStore.updateTabKey(true);
      if (data?.tutorialId) {
        page.initPageFunc = () => {
          openTutorialPage(data?.tutorialId);
        };
      }
      history.push(pageStore.generatePagePath());
      return;
    }
  } else {
    return 'create session failed';
  }
};
