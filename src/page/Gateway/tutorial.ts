/*
 * Copyright 2024 OceanBase
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
  return '';
  // const { data } = actionData;
  // const connectionList = await connection.getList({
  //   page: 1,
  //   size: 1,
  //   visibleScope: IConnectionType.ORGANIZATION,
  // });

  // const firstConnection = connectionList?.contents?.[0];
  // if (!firstConnection) {
  //   return formatMessage({
  //     id: 'odc.page.Gateway.tutorial.FailedToInitializeTheConnection',
  //   }); //初始化连接失败
  // }
  // let sessionId;
  // try {
  //   sessionId = await connection.connect(firstConnection.id?.toString(), null, null, true);
  // } catch (e) {
  //   if (e) {
  //     return e.message;
  //   }
  // }

  // if (sessionId) {
  //   const isSuccess = await connection.get(sessionId);

  //   if (isSuccess) {
  //     if (connection.connection.defaultDBName) {
  //       schema.database = {
  //         name: connection.connection.defaultDBName,
  //       };
  //     }
  //     commonStore.updateTabKey(true);
  //     if (data?.tutorialId) {
  //       page.initPageFunc = () => {
  //         openTutorialPage(data?.tutorialId);
  //       };
  //     }
  //     history.push(pageStore.generatePagePath());
  //     return;
  //   }
  // } else {
  //   return 'create session failed';
  // }
};
