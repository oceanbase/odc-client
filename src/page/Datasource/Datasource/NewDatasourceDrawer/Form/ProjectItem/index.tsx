import { listProjects } from '@/common/network/project';
import { useRequest } from 'ahooks';
import { Alert, Form, Space, Tooltip } from 'antd';
import React, { useContext, useMemo } from 'react';
import DatasourceFormContext from '../context';
import ProjectSelect from './ProjectSelect';
import { ProjectRole } from '@/d.ts/project';
import { ExclamationCircleFilled } from '@ant-design/icons';

interface IProps {}

const ProjectItem: React.FC<IProps> = function () {
  const context = useContext(DatasourceFormContext);
  const projectId = Form.useWatch('projectId', context.form);
  const { data, loading } = useRequest(listProjects, {
    defaultParams: [null, 1, 9999, false],
  });
  const extra = useMemo(() => {
    if (
      !context?.isEdit ||
      !context?.originDatasource?.projectId ||
      context?.originDatasource?.projectId === projectId
    ) {
      return null;
    }
    const icon = <ExclamationCircleFilled />;
    if (projectId) {
      return (
        <Alert
          style={{ marginTop: -8 }}
          showIcon
          icon={icon}
          type="error"
          message="修改项目后，此数据源下的所有数据库将绑定新的项目"
        />
      );
    }
    return (
      <Alert
        style={{ marginTop: -8 }}
        showIcon
        icon={icon}
        type="error"
        message="不绑定项目后，此数据源下的所有数据库将从原项目中移出"
      />
    );
  }, [context?.isEdit, context?.originDatasource, projectId]);
  const options = useMemo(() => {
    const base = [];
    if (context?.isEdit && context?.originDatasource?.projectId) {
      base.push({
        label: context?.originDatasource?.projectName,
        value: context?.originDatasource?.projectId,
      });
    }
    return base
      .concat(
        data?.contents?.map((item) => {
          if (item.id === context?.originDatasource?.projectId) {
            return null;
          }
          let disabledInfo: string = null;
          if (
            !item.currentUserResourceRoles?.includes(ProjectRole.DBA) &&
            !item.currentUserResourceRoles?.includes(ProjectRole.OWNER)
          ) {
            disabledInfo = '非项目管理员或 DBA，无法将数据源加入此项目';
          }
          return {
            label: (
              <Tooltip title={disabledInfo}>
                <div>{item.name}</div>
              </Tooltip>
            ),
            value: item.id,
            disabled: !!disabledInfo,
          };
        }),
      )
      .filter(Boolean);
  }, [data, context?.originDatasource, context?.isEdit]);
  return (
    <Space direction="vertical" size={1}>
      <Form.Item
        name={'projectId'}
        label="项目"
        requiredMark={false}
        extra={'绑定项目后，数据源内的所有数据库将移入此项目'}
      >
        <ProjectSelect
          loading={loading}
          options={options}
          showSearch
          optionFilterProp="children"
          style={{
            width: 208,
          }}
        />
      </Form.Item>
      {extra}
    </Space>
  );
};

export default ProjectItem;
