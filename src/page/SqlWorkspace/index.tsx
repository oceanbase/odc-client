import { formatMessage } from '@/util/intl';
import React from 'react';

interface IProps {}
const SqlWorkspace: React.FC<IProps> = () => {
  return <h2>{formatMessage({ id: 'odc.page.SqlWorkspace.SqlWorkbench' }) /*SQL 工作台*/}</h2>;
};

export default SqlWorkspace;
