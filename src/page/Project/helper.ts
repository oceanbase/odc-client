import { IProject } from '@/d.ts/project';
import { UserStore } from '@/store/login';

/**
 * 已归档项目
 * 数据库页：隐藏顶部按钮、列表checkbox，操作列以及列数据库名称不可点击
 * 工单页: 隐藏新建按钮
 * 成员页：隐藏新建按钮和操作列
 * 敏感表页:隐藏添加、checkbox、操作列
 * 消息页:
 *      隐藏tab-推送规则下的列表checkbox，启用状态、操作列
 *      隐藏tab-推送通道下的新建按钮，操作列
 * 设置页：禁用项目名称修改、描述、展示操作按钮删除项目
 */
export const isProjectArchived = (project: IProject) => {
  return !!project?.archived;
};

export const getSessionStorageKey = (userStore: UserStore) => {
  return `projectSearch-${userStore?.organizationId}-${userStore?.user?.id}`;
};
