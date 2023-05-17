import { inject, observer } from 'mobx-react';
import RecordPage from './RecordPage';

const Record = () => {
  return <RecordPage />;
};

// export default Record;

export default inject(
  'userStore',
  'settingStore',
  'schemaStore',
  'taskStore',
  'modalStore',
)(observer(Record));
