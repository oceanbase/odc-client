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
