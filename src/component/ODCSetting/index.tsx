import { Col, Divider, Form, Menu, Modal, Row, Space, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import odcSetting, { IODCSetting, ODCSettingGroup } from './config';

import styles from './index.less';

interface IProps {}

const ODCSetting: React.FC<IProps> = () => {
  const [formRef] = Form.useForm();
  const formBoxRef = React.createRef<HTMLDivElement>();
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

  function scrollToKey(key: string) {
    const element = document.querySelector(`[data-name=${key}]`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  function addListener() {
    const dom = formBoxRef.current;
    // 滚动事件监听器
    function listener() {
      // 获取容器A的当前滚动位置和高度
      const scrollTop = dom.scrollTop;
      const containerHeight = dom.clientHeight;

      // 遍历所有子节点
      const children = dom.querySelectorAll<HTMLHeadingElement>('[data-name]'); // 假定子节点有共同的类名'child'
      children.forEach((child) => {
        // 获取子节点相对于容器A顶部的位置
        const childOffsetTop = child.offsetTop;
        const childHeight = child.clientHeight;
      });
    }
    formBoxRef.current?.addEventListener('scroll', listener);
    return () => {
      formBoxRef.current?.removeEventListener('scroll', listener);
    };
  }

  useEffect(() => {
    const clear = addListener();
    return () => {
      clear();
    };
  }, []);

  return (
    <Modal wrapClassName={styles.modal} width={760} open={true} title="设置" footer={null}>
      <div className={styles.box}>
        <div ref={formBoxRef} className={styles.content}>
          <Form form={formRef} layout="vertical">
            {Array.from(data.values()).map((groupData) => {
              return (
                <>
                  <Typography.Title data-name={groupData.key} level={5}>
                    {groupData?.label}
                  </Typography.Title>
                  {Array.from(groupData?.secondGroup?.values()).map((group, index) => {
                    return (
                      <>
                        <Space
                          style={{ width: '100%', paddingLeft: 8, marginTop: 12 }}
                          direction="vertical"
                        >
                          {!!group.label && <Typography.Text strong>{group.label}</Typography.Text>}
                          <Row style={{ paddingLeft: 12 }} gutter={20}>
                            {group.settings.map((set, index) => {
                              return (
                                <Col span={set.span || 10}>
                                  <Form.Item
                                    label={<Typography.Text>{set.label}</Typography.Text>}
                                    name={set.key}
                                    key={set.key}
                                  >
                                    {set.render(null, async () => {})}
                                  </Form.Item>
                                </Col>
                              );
                            })}
                          </Row>
                        </Space>
                        {groupData?.secondGroup.size == index + 1 ? (
                          <div style={{ margin: '0px 0px 24px 0px' }} />
                        ) : null}
                      </>
                    );
                  })}
                </>
              );
            })}
          </Form>
        </div>
        <div className={styles.menu}>
          <Menu
            selectedKeys={[activeKey]}
            onClick={({ key }) => {
              setActiveKey(key);
              scrollToKey(key);
            }}
            items={Array.from(data.values()).map((g) => {
              return {
                label: g.label,
                key: g.key,
              };
            })}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ODCSetting;
