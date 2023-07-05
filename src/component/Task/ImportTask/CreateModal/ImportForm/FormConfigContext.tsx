import React from 'react';
import type { IState as IImportDrawerState } from '../index';

interface IFormContext {
  dfaultConfig?: IImportDrawerState['formData'];
}

const FormConfigContext = React.createContext<IFormContext>({ dfaultConfig: null });

export default FormConfigContext;
