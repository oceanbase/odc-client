import RiskLevelLabel from '@/component/RiskLevelLabel';
import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import Icon from '@ant-design/icons';
import ProjectSvg from '@/svgr/project_space.svg';

export default function TreeTitle({
  project,
  datasource,
}: {
  project?: IProject;
  datasource?: IDatasource;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {!!datasource && (
        <>
          <div style={{ flexShrink: 0, flexGrow: 0 }}>
            <RiskLevelLabel
              content={datasource?.environmentName}
              color={datasource?.environmentStyle?.toLowerCase()}
            />
          </div>
          <div
            style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {datasource?.name}
          </div>
        </>
      )}
      {!!project && (
        <>
          <div style={{ flexShrink: 0, flexGrow: 0, paddingRight: 8 }}>
            <Icon
              component={ProjectSvg}
              style={{ fontSize: '14px', verticalAlign: 'text-bottom' }}
            />
          </div>
          <div
            style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {project?.name}
          </div>
        </>
      )}
    </div>
  );
}
