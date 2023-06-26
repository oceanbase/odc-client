import OBClient from '@/page/Workspace/components/OBClientPage';
import { toInteger } from 'lodash';

export default function OBClientPage({ id }: { id: string }) {
  if (!id) {
    return null;
  }
  return <OBClient simpleHeader theme="white" key={id} datasourceId={toInteger(id)} />;
}
