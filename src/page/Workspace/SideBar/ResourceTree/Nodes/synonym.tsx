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

import { DbObjectType, SynonymType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { openSynonymViewPage } from '@/store/helper/page';
import SessionStore from '@/store/sessionManager/session';
import { ReactComponent as SynonymSvg } from '@/svgr/menuSynonym.svg';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';

export function SynonymTreeData(
  dbSession: SessionStore,
  database: IDatabase,
  isPublic: boolean = false,
): TreeDataNode {
  const dbName = database.name;
  const synonyms = isPublic ? dbSession?.database?.publicSynonyms : dbSession?.database?.synonyms;
  const treeData: TreeDataNode = {
    title: isPublic
      ? formatMessage({
          id: 'odc.ResourceTree.Nodes.synonym.CommonSynonyms',
          defaultMessage: '公共同义词',
        }) //公共同义词
      : formatMessage({ id: 'odc.ResourceTree.Nodes.synonym.Synonym', defaultMessage: '同义词' }), //同义词
    key: `${database.id}-${dbName}-synonym-${isPublic}`,
    type: isPublic ? ResourceNodeType.PublicSynonymRoot : ResourceNodeType.SynonymRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (synonyms) {
    treeData.children = synonyms.map((synonym) => {
      const key = `${database.id}-${dbName}-sequence-${isPublic}-${synonym.synonymName}`;
      return {
        title: synonym.synonymName,
        key,
        type: isPublic ? ResourceNodeType.PublicSynonym : ResourceNodeType.Synonym,
        data: synonym,
        dbObjectType: DbObjectType.synonym,
        icon: (
          <Icon
            component={SynonymSvg}
            style={{
              color: 'var(--icon-color-5)',
            }}
          />
        ),

        doubleClick(session, node) {
          openSynonymViewPage(
            synonym.synonymName,
            isPublic ? SynonymType.PUBLIC : SynonymType.COMMON,
            session?.database?.databaseId,
          );
        },
        sessionId: dbSession?.sessionId,
        isLeaf: true,
      };
    });
  }

  return treeData;
}
