import databaseSettings from './config/database';
import editorSettings from './config/editor';
import perferenceSettings from './config/preference';
import performanceSettings from './config/performance';
import accountSettings from './config/account';

export interface ODCSettingGroup {
  label: string;
  key: string;
}

export interface IODCSetting<T = any> {
  label: string;
  key: string;
  group: ODCSettingGroup;
  secondGroup: ODCSettingGroup;
  /**
   * 渲染宽度
   */
  span?: number;
  storeType: 'server' | 'locale';
  render: (value: T, onChange: (value: T) => Promise<void>) => React.ReactNode;
}

/**
 * setting
 */
const odcSetting: IODCSetting[] = []
  .concat(databaseSettings)
  .concat(editorSettings)
  .concat(perferenceSettings)
  .concat(performanceSettings)
  .concat(accountSettings);
export default odcSetting;
