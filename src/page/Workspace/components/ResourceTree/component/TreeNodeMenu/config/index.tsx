import { sequenceMenusConfig } from './sequence';
import { synonymMenusConfig } from './synonym';
import { tableMenusConfig } from './table';
import { viewMenusConfig } from './view';

export default {
  ...tableMenusConfig,
  ...viewMenusConfig,
  ...sequenceMenusConfig,
  ...synonymMenusConfig,
};
