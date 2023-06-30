import { IProject } from '@/d.ts/project';
import React from 'react';

interface IProjectContext {
  project: IProject | null;
  projectId: number;
  reloadProject: () => void;
}

const ProjectContext = React.createContext<IProjectContext>({
  project: null,
  projectId: null,
  reloadProject: () => {},
});

export default ProjectContext;
