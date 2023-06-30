import React from 'react';
import type { IImportDrawerState } from '../index';

interface IFormContext {
  dfaultConfig?: IImportDrawerState['formData'];
}

const FormConfigContext = React.createContext<IFormContext>({ dfaultConfig: null });

export default FormConfigContext;
