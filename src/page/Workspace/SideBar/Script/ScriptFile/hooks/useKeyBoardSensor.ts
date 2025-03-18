import { useEffect, useState, useContext } from 'react';
import ActivityBarContext from '@/page/Workspace/context/ActivityBarContext';
import { ActivityBarItemType } from '@/page/Workspace/ActivityBar/type';

const useKeyBoardSensor = () => {
  const activityContext = useContext(ActivityBarContext);
  const [crtlorCommandPressed, setCrtlorCommandPressed] = useState<boolean>(false);
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setCrtlorCommandPressed(true);
    }
    if (event.shiftKey) {
      setShiftPressed(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) {
      setCrtlorCommandPressed(false);
    }
    if (!event.shiftKey) {
      setShiftPressed(false);
    }
  };

  useEffect(() => {
    if (activityContext.activeKey === ActivityBarItemType.Script) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activityContext.activeKey]);

  return {
    crtlorCommandPressed,
    shiftPressed,
  };
};

export default useKeyBoardSensor;
