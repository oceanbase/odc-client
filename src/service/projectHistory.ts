import login from '@/store/login';
import logger from '@/util/logger';
import { safeParseJson } from '@/util/utils';
import { history } from '@umijs/max';

const keyBuilder = function () {
  const organizationId = login.organizationId;
  const userId = login.user?.id;
  if (!organizationId || !userId) {
    return null;
  }
  return `odcProjectHistory-o:${organizationId}-u:${userId}`;
};

function getData() {
  return safeParseJson(window.localStorage.getItem(keyBuilder()));
}

export function getDefaultProject() {
  const data = getData();
  if (data) {
    return parseInt(getData());
  }
}

export function setDefaultProject(projectId: number) {
  const key = keyBuilder();
  if (!key) {
    logger.warn('key not found');
    return;
  }
  window.localStorage.setItem(key, projectId?.toString());
}

export function toDefaultProjectPage() {
  const projectId = getDefaultProject();
  if (!projectId) {
    history.push('/project');
  } else {
    history.push(`/project/${projectId}/database`);
  }
}
