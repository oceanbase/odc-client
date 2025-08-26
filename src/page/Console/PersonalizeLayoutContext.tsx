import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorageState } from 'ahooks';
import login from '@/store/login';
import { defaultCheckedKeys } from './components/PersonalizeLayoutSetting';

interface PersonalizeLayoutContextType {
  checkedKeys: React.Key[];
  setCheckedKeys: (keys: React.Key[]) => void;
}

export const PersonalizeLayoutContext = createContext<PersonalizeLayoutContextType | undefined>(
  undefined,
);

interface PersonalizeLayoutProviderProps {
  children: ReactNode;
}

export const PersonalizeLayoutProvider: React.FC<PersonalizeLayoutProviderProps> = ({
  children,
}) => {
  const [checkedKeys, setCheckedKeys] = useLocalStorageState<React.Key[]>(
    `personalizeLayoutCheckedKeys-${login.organizationId}`,
  );

  return (
    <PersonalizeLayoutContext.Provider
      value={{
        checkedKeys: checkedKeys || defaultCheckedKeys,
        setCheckedKeys,
      }}
    >
      {children}
    </PersonalizeLayoutContext.Provider>
  );
};
