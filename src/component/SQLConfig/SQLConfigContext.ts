import SessionStore from '@/store/sessionManager/session';
import React from 'react';

const SQLConfigContext = React.createContext<{
  session: SessionStore;
  pageKey: string;
}>({
  session: null,
  pageKey: null,
});

export default SQLConfigContext;
