import { ConnectionMode } from '@/d.ts';
export { default } from './CreateModal';
export { getItems } from './DetailContent';

const getEditorLang = (mode: ConnectionMode) =>{
    return mode === ConnectionMode.OB_MYSQL ? 'obmysql' : 'oboracle';
}