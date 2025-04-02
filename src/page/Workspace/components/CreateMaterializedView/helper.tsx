import { RefreshMethod } from '@/d.ts';
const JOIN_KEYWORDS_REFRESH_FORCE = [',', 'inner join', 'join', 'cross join'];

const getJoinKeywords = (refreshMethod: RefreshMethod) => {
  return refreshMethod === RefreshMethod.REFRESH_FAST ? JOIN_KEYWORDS_REFRESH_FORCE : undefined;
};
export { getJoinKeywords };
