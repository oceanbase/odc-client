import React from 'react';
import type { IExportDrawerState } from '../index';

interface IFormContext {
  dfaultConfig?: IExportDrawerState['formData'];
}

const FormContext = React.createContext<IFormContext>({ dfaultConfig: null });

export default FormContext;
