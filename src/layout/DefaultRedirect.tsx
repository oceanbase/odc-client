import { getDefaultProjectPage } from '@/service/projectHistory';
import { Navigate } from '@umijs/max';

export default function DefaultRedirect() {
  const defaultPath = getDefaultProjectPage();
  return <Navigate to={defaultPath} replace />;
}
