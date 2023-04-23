import { IDatabase } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import Icon, { FolderOpenFilled } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';

import SequenceSvg from '@/svgr/menuSequence.svg';

export function SequenceTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const sequences = dbSession?.database?.sequences;
  const treeData: TreeDataNode = {
    title: '序列',
    key: `${dbName}-sequence`,
    type: ResourceNodeType.SequenceRoot,
    data: database,
    icon: (
      <FolderOpenFilled
        style={{
          color: '#3FA3FF',
        }}
      />
    ),
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (sequences) {
    treeData.children = sequences.map((sequence) => {
      const key = `${dbName}-sequence-${sequence.name}`;
      return {
        title: sequence.name,
        key,
        type: ResourceNodeType.Sequence,
        data: sequence,
        icon: (
          <Icon
            component={SequenceSvg}
            style={{
              color: 'var(--icon-color-5)',
            }}
          />
        ),
        sessionId: dbSession?.sessionId,
        isLeaf: true,
      };
    });
  }

  return treeData;
}
