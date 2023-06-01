import React from 'react';

export interface IFormContext {
  updateFormData: (newValue: Record<string, any>) => void;
}

const FormContext = React.createContext<IFormContext>({
  updateFormData: (v) => {},
});

export default FormContext;
