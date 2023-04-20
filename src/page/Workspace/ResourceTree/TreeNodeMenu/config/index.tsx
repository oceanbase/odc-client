import { databaseMenusConfig } from './database';
import { functionMenusConfig } from './function';
import { packageMenusConfig } from './package';
import { packageBodyMenusConfig } from './packageBody';
import { procedureMenusConfig } from './procedure';
import { sequenceMenusConfig } from './sequence';
import { synonymMenusConfig } from './synonym';
import { tableMenusConfig } from './table';
import { triggerMenusConfig } from './trigger';
import { typeMenusConfig } from './type';
import { viewMenusConfig } from './view';

export default {
  ...tableMenusConfig,
  ...viewMenusConfig,
  ...sequenceMenusConfig,
  ...synonymMenusConfig,
  ...triggerMenusConfig,
  ...functionMenusConfig,
  ...procedureMenusConfig,
  ...typeMenusConfig,
  ...packageMenusConfig,
  ...packageBodyMenusConfig,
  ...databaseMenusConfig,
};
