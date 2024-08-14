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

import { DbObjectType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';

import { IDatabase } from '@/d.ts/database';
import { openSequenceViewPage } from '@/store/helper/page';
import { ReactComponent as SequenceSvg } from '@/svgr/menuSequence.svg';

export function SequenceTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const sequences = dbSession?.database?.sequences;
  const treeData: TreeDataNode = {
    title: formatMessage({
      id: 'odc.ResourceTree.Nodes.sequence.Sequence',
      defaultMessage: '序列',
    }), //序列
    key: `${database.id}-${dbName}-sequence`,
    type: ResourceNodeType.SequenceRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (sequences) {
    treeData.children = sequences.map((sequence) => {
      const key = `${database.id}-${dbSession?.database?.sequenceVersion}-${dbName}-sequence-${sequence.name}`;
      return {
        title: sequence.name,
        key,
        type: ResourceNodeType.Sequence,
        data: sequence,
        dbObjectType: DbObjectType.sequence,
        icon: (
          <Icon
            component={SequenceSvg}
            style={{
              color: 'var(--icon-color-5)',
            }}
          />
        ),

        doubleClick(session, node, databaseFrom) {
          openSequenceViewPage(sequence.name, undefined, session?.database?.databaseId);
        },
        sessionId: dbSession?.sessionId,
        isLeaf: true,
      };
    });
  }

  return treeData;
}
