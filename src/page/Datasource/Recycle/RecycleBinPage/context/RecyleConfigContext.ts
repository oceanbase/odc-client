import { IRecycleConfig } from '@/d.ts';
import React from 'react';

interface IRecyleConfigContext {
  setting: IRecycleConfig;
  changeSetting?: (config: Partial<IRecycleConfig>) => Promise<boolean>;
}

const defaultContext: IRecyleConfigContext = {
  setting: {
    objectExpireTime: '',
    recyclebinEnabled: false,
    truncateFlashbackEnabled: false,
  },
  changeSetting: null,
};

const RecyleConfigContext = React.createContext<IRecyleConfigContext>(defaultContext);

export default RecyleConfigContext;
