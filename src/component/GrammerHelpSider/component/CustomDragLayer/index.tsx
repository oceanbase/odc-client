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

import snippetStore from '@/store/snippet';
import { PlusCircleFilled } from '@ant-design/icons';
import { useDragLayer } from 'react-dnd';
import { ItemTypes } from '../../ItemTypes';
import styles from './index.less';

export default (props) => {
  const { itemType, isDragging, clientOffset } = useDragLayer((monitor) => {
    return {
      itemType: monitor.getItemType(),
      clientOffset: monitor.getClientOffset(),
      isDragging: monitor.isDragging(),
    };
  });

  function getDragBoxStyle(clientOffset) {
    if (!clientOffset) {
      return {
        display: 'none',
      };
    }
    let { x, y } = clientOffset;
    const transform = `translate(${x + 11}px, ${y + 16}px)`;
    return {
      transform,
      WebkitTransform: transform,
    };
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div className={styles.dragLayer}>
      {itemType === ItemTypes.BOX ? (
        <div className={styles.dragBox} style={getDragBoxStyle(clientOffset)}>
          <div className={styles.dragIcon}>
            <PlusCircleFilled />
          </div>
          {(snippetStore.snippetDragging || {}).prefix}
        </div>
      ) : null}
    </div>
  );
};
