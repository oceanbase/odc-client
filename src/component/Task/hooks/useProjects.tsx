import { useState } from 'react';
import { getProjectList } from '@/common/network/task';

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);

  const projectOptions = projects?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const loadProjects = async () => {
    const res = await getProjectList(false);
    setProjects(res?.contents);
  };

  return {
    projects,
    projectOptions,
    loadProjects,
  };
};
