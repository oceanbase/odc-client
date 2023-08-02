import { IDatabase } from '@/d.ts/database';
import { IProject } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { Checkbox, Select, Space } from 'antd';
import { isNull } from 'lodash';

interface IProps {
  value?: any;
  onChange?: (v: any) => void;
  projects: IProject[];
  currentDatabase: IDatabase;
}

export default function ProjectSelect({ projects, value, currentDatabase, onChange }: IProps) {
  const isProjectNotFound = !projects?.find((item) => item.id === currentDatabase?.project?.id);
  const _isNull = isNull(value);
  return (
    <Space>
      <Select
        value={value}
        style={{ width: 230 }}
        onChange={(v) => {
          onChange(v);
        }}
        disabled={_isNull}
      >
        {projects?.map((item) => {
          return (
            <Select.Option value={item.id} key={item.id}>
              {item.name}
            </Select.Option>
          );
        })}
        {isProjectNotFound && currentDatabase?.project?.id ? (
          <Select.Option value={currentDatabase?.project?.id} key={currentDatabase?.project?.id}>
            {currentDatabase?.project?.name}
          </Select.Option>
        ) : null}
      </Select>
      <Checkbox
        checked={_isNull}
        onChange={(e) => (e.target.checked ? onChange(null) : onChange(undefined))}
      >
        {
          formatMessage({
            id: 'odc.Info.ChangeProjectModal.ProjectSelect.DoNotAssignProjects',
          }) /*不分配项目*/
        }
      </Checkbox>
    </Space>
  );
}
