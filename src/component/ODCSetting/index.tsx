import { Col, Divider, Form, Menu, Modal, Row, Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import odcSetting, { IODCSetting, ODCSettingGroup } from './config';

import styles from './index.less';

interface IProps {}

const ODCSetting: React.FC<IProps> = () => {
  const data = useMemo(() => {
    const result = new Map<
      string,
      ODCSettingGroup & {
        secondGroup: Map<
          string,
          ODCSettingGroup & {
            settings: IODCSetting[];
          }
        >;
      }
    >();
    odcSetting.forEach((setting) => {
      const { group, secondGroup, key, render } = setting;
      if (!result.has(group.key)) {
        result.set(group.key, {
          ...group,
          secondGroup: new Map(),
        });
      }
      const groupItem = result.get(group.key);
      if (!groupItem.secondGroup.has(secondGroup.key)) {
        groupItem.secondGroup.set(secondGroup.key, {
          ...secondGroup,
          settings: [],
        });
      }
      const secondGroupItem = groupItem.secondGroup.get(secondGroup.key);
      secondGroupItem.settings.push(setting);
    });
    return result;
  }, [odcSetting]);

  const [activeKey, setActiveKey] = useState(data.keys().next().value);
  const groupData = data.get(activeKey);
  return (
    <Modal wrapClassName={styles.modal} width={760} open={true} title="设置" footer={null}>
      <div className={styles.box}>
        <div className={styles.menu}>
          <Menu
            selectedKeys={[activeKey]}
            onClick={({ key }) => {
              setActiveKey(key);
            }}
            items={Array.from(data.values()).map((g) => {
              return {
                label: g.label,
                key: g.key,
              };
            })}
          />
        </div>
        <div className={styles.content}>
          {Array.from(groupData?.secondGroup?.values()).map((group) => {
            return (
              <>
                <Space direction="vertical">
                  <Typography.Title level={5}>{group.label}</Typography.Title>
                  <Row style={{ paddingLeft: 12 }} gutter={20}>
                    {group.settings.map((set) => {
                      return (
                        <Col span={set.span || 10}>
                          <Form.Item label={set.label} name={set.label} key={set.key}>
                            {set.render(null, async () => {})}
                          </Form.Item>
                        </Col>
                      );
                    })}
                  </Row>
                </Space>
                <Divider />
              </>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ODCSetting;
