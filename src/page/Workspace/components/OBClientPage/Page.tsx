import { OBClientPage as OBClientPageModel } from '@/store/helper/page/pages';
import { SettingStore } from '@/store/setting';
import { inject, observer } from 'mobx-react';
import OBClient from '.';

interface IProps {
  params: OBClientPageModel['pageParams'];
  settingStore?: SettingStore;
}

export default inject('settingStore')(
  observer(function OBClientPage({ params, settingStore }: IProps) {
    return <OBClient theme={settingStore.theme?.cmdTheme} datasourceId={params?.dataSourceId} />;
  }),
);
