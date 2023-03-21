import { ISubSession } from '@/store/connection';
import React from 'react';

const SQLConfigContext = React.createContext<{
  session: ISubSession;
  pageKey: string;
}>({
  session: null,
  pageKey: null,
});

export default SQLConfigContext;
