import { IManagerIntegration } from '@/d.ts';
import { IEnvironment } from '@/d.ts/environment';
import React from 'react';

export interface IEnvironmentContext {
  currentEnvironment: IEnvironment;
  integrations: IManagerIntegration[];
  integrationsIdMap: { [key in number | string]: string };
}

export const EnvironmentContext = React.createContext<IEnvironmentContext>({
  currentEnvironment: null,
  integrations: [],
  integrationsIdMap: {},
});
