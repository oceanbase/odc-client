import { Form, Select, Checkbox, Row, Col, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useContext, useMemo } from 'react';
import ProjectContext from '../../../ProjectContext';
import { projectRoleTextMap } from '@/page/Project/User';
import { DefaultOptionType } from 'antd/es/select';
import { IProject } from '@/d.ts/project';

interface IProps {
  notSetAdmin?: boolean;
  setNotSetAdmin?: React.Dispatch<React.SetStateAction<boolean>>;
  ownerIds?: number[];
  setFormOwnerIds?: (val: []) => void;
  value?: number[];
  hasDefaultSet?: boolean;
  disabled?: boolean;
  projectInfo?: IProject;
}

const { Option } = Select;

export const DatabaseOwnerSelect = ({
  notSetAdmin = false,
  setNotSetAdmin,
  ownerIds,
  setFormOwnerIds,
  hasDefaultSet = true,
  disabled = false,
  projectInfo,
}: IProps) => {
  let { project } = useContext(ProjectContext);
  project = projectInfo || project;

  /**
   *  去重后的项目成员作为库Owner的可选项
   */
  const projectUserOptions: DefaultOptionType[] = useMemo(() => {
    const userMap = new Map<number, DefaultOptionType>();
    project?.members?.forEach((mem) => {
      const { id, name, role } = mem;
      if (!userMap.has(id)) {
        userMap.set(id, {
          value: id,
          label: name,
          disabled: !ownerIds?.includes(id),
          role: [role],
        });
      } else {
        // 多角色
        userMap.set(id, {
          value: userMap.get(id)?.value,
          label: userMap.get(id)?.label,
          disabled: userMap.get(id)?.disabled,
          role: [...userMap.get(id)?.role, role],
        });
      }
    });
    return [...userMap.values()];
  }, [project?.members, ownerIds]);

  return (
    <Row gutter={16}>
      <Col span={hasDefaultSet ? 12 : 24}>
        <Form.Item
          name="ownerIds"
          label={
            <span>
              <span style={{ paddingRight: 4 }}>库管理员</span>
              <Tooltip
                title="在原有项目角色的基础上，拥有该库的审批权限"
                overlayInnerStyle={{ width: 268 }}
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
        >
          <Select
            allowClear
            mode="multiple"
            placeholder="请选择"
            style={{
              width: '100%',
            }}
            optionFilterProp="label"
            disabled={notSetAdmin || disabled}
            optionLabelProp="label"
            onChange={(val) => {
              setFormOwnerIds(val);
            }}
          >
            {projectUserOptions.map((item) => {
              return (
                <Option key={item.value} value={item.value} label={item.label}>
                  {item.label}
                  <span style={{ paddingLeft: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                    {item?.role?.map((i) => projectRoleTextMap[i]).join(',')}
                  </span>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </Col>
      {hasDefaultSet && (
        <Col span={12}>
          <Checkbox
            checked={notSetAdmin}
            onChange={() => {
              setNotSetAdmin(!notSetAdmin);
              setFormOwnerIds([]);
            }}
            style={{ marginTop: 30 }}
          >
            不设置管理员
          </Checkbox>
        </Col>
      )}
    </Row>
  );
};
