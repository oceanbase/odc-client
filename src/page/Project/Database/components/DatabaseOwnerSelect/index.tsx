import { formatMessage } from '@/util/intl';
import { Form, Select, Checkbox, Row, Col, Tooltip } from 'antd';
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
      const { id, name, role, userEnabled } = mem;
      if (!userMap.has(id)) {
        userMap.set(id, {
          value: id,
          label: name,
          disabled: !userEnabled,
          role: [role],
        });
      } else {
        // 多角色
        userMap.set(id, {
          value: userMap.get(id)?.value,
          label: userMap.get(id)?.label,
          disabled: userMap.get(id)?.disabled || !userEnabled,
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
              <span style={{ paddingRight: 4 }}>
                {formatMessage({
                  id: 'src.page.Project.Database.components.DatabaseOwnerSelect.tsx.556A83EA',
                  defaultMessage: '库管理员',
                })}
              </span>
              <Tooltip
                title={formatMessage({
                  id: 'src.page.Project.Database.components.DatabaseOwnerSelect.tsx.34B8A74A',
                  defaultMessage: '库管理员是数据库和表的负责人，可以在审批流程中引用',
                })}
                color="#fff"
                overlayInnerStyle={{ width: 268, color: '#132039' }}
              >
                <QuestionCircleOutlined style={{ color: 'var(--icon-normal-color)' }} />
              </Tooltip>
            </span>
          }
          rules={
            hasDefaultSet && !notSetAdmin
              ? [
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.page.Project.Database.components.DatabaseOwnerSelect.tsx.CBBD314E',
                      defaultMessage: '请输入',
                    }),
                  },
                ]
              : null
          }
        >
          <Select
            allowClear
            mode="multiple"
            placeholder={formatMessage({
              id: 'src.page.Project.Database.components.DatabaseOwnerSelect.tsx.094820AF',
              defaultMessage: '请选择',
            })}
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{item.label}</span>
                    <span
                      style={{
                        padding: '0 8px',
                        fontSize: 12,
                        color: 'var(--neutral-black45-color)',
                      }}
                    >
                      {item?.role?.map((i) => projectRoleTextMap[i]).join(',')}
                    </span>
                    {item.disabled ? (
                      <Tooltip
                        title={
                          item?.disabled
                            ? formatMessage({
                                id: 'src.page.Project.Database.components.DatabaseOwnerSelect.tsx.A9AFE6EF',
                                defaultMessage: '用户已禁用',
                              })
                            : ''
                        }
                      >
                        <InfoCircleOutlined style={{ color: 'var(--text-color-secondary)' }} />
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                  </div>
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
            {formatMessage({
              id: 'src.page.Project.Database.components.DatabaseOwnerSelect.tsx.2882064F',
              defaultMessage: '不设置管理员',
            })}
          </Checkbox>
        </Col>
      )}
    </Row>
  );
};
