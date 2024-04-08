/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { formatMessage } from '@/util/intl';
import { Button, Col, Form, Modal, Row, Space, Tabs, Typography, message } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import odcSetting, { IODCSetting, ODCSettingGroup, odcSettingMap } from './config';

import styles from './index.less';
import { inject, observer } from 'mobx-react';
import modal, { ModalStore } from '@/store/modal';
import setting from '@/store/setting';
import { IUserConfig } from '@/d.ts';
import { getODCSetting, saveODCSetting } from '@/util/client';
import { isClient } from '@/util/env';
import { safeParseJson } from '@/util/utils';

interface IProps {
  modalStore?: ModalStore;
}

const ODCSetting: React.FC<IProps> = ({ modalStore }) => {
  const [formRef] = Form.useForm();
  const [changed, setChanged] = useState(false);
  const formBoxRef = React.createRef<HTMLDivElement>();
  const scrollSwitcher = useRef<Boolean>(true);
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
      const { group, secondGroup, key, render, storeType, disabledInClient } = setting;
      if (!isClient() && storeType === 'local') {
        return;
      }
      if (isClient() && disabledInClient) {
        return;
      }
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
    scrollSwitcher.current = false;
    const element = document.querySelector(`[data-name=${key}]`);
    if (element) {
      element.scrollIntoView();
    }
    setTimeout(() => {
      scrollSwitcher.current = true;
    });
  }

  function addListener() {
    const dom = formBoxRef.current;
    // 滚动事件监听器
    function listener() {
      if (!scrollSwitcher.current) {
        return;
      }
      // 获取容器A的当前滚动位置和高度
      const scrollTop = dom.scrollTop;

      // 遍历所有子节点
      const children = dom.querySelectorAll<HTMLHeadingElement>('[data-name]'); // 假定子节点有共同的类名'child'
      let min = Number.MAX_SAFE_INTEGER;
      let key;
      children.forEach((child) => {
        // 获取子节点相对于容器A顶部的位置
        const childOffsetTop = child.offsetTop;
        let distance = childOffsetTop - scrollTop;
        if (distance >= 0) {
          distance = distance / 2;
        }
        const distanceAbs = Math.abs(distance);
        if (distanceAbs < min) {
          min = distanceAbs;
          key = child.getAttribute('data-name');
        }
      });
      if (!key) {
        return;
      }
      setActiveKey(key);
    }
    formBoxRef.current?.addEventListener('scroll', listener);
    return () => {
      formBoxRef.current?.removeEventListener('scroll', listener);
    };
  }

  function close(force: boolean = false) {
    if (changed && !force) {
      Modal.confirm({
        title: formatMessage({ id: 'src.component.ODCSetting.983C51BC' }), //'确认要取消修改配置吗？'
        onOk: () => {
          setChanged(false);
          modalStore.changeOdcSettingVisible(false);
        },
      });
    } else {
      setChanged(false);
      modalStore.changeOdcSettingVisible(false);
    }
  }

  async function loadData() {
    let data = setting.configurations || {};
    if (isClient()) {
      const clientData = safeParseJson(await getODCSetting(), {});
      data = { ...data, ...clientData };
    }
    formRef.setFieldsValue(data);
  }

  useEffect(() => {
    if (!modalStore.odcSettingVisible) {
      return;
    }
    const clear = addListener();
    loadData();
    return () => {
      clear();
    };
  }, [modalStore.odcSettingVisible]);

  async function save() {
    const values = await formRef.validateFields();
    const serverData: Record<string, string> = {},
      localData = {};
    Object.keys(values).forEach((key) => {
      const info = odcSettingMap[key];
      switch (info.storeType) {
        case 'server': {
          serverData[key] = values[key];
          break;
        }
        case 'local': {
          localData[key] = values[key];
          break;
        }
      }
    });
    /**
     * submit serverData
     */
    const isSuccess = await setting.updateUserConfig(serverData as any);
    /**
     * submit localData
     */
    if (isClient()) {
      await saveODCSetting(JSON.stringify(localData));
    }
    if (isSuccess) {
      message.success(formatMessage({ id: 'src.component.ODCSetting.E6DD81BF' /*'保存成功'*/ }));
      close(true);
    }
  }

  function reset() {
    Modal.confirm({
      title: formatMessage({ id: 'src.component.ODCSetting.647A18AA' }), //'确定要恢复默认设置吗？'
      onOk: async () => {
        const isSuccess = await setting.resetUserConfig();
        if (isSuccess) {
          message.success(
            formatMessage({ id: 'src.component.ODCSetting.654799D1' /*'已恢复到默认配置'*/ }),
          );
          close(true);
        }
      },
    });
  }

  function footerRender() {
    return (
      <Space>
        <Button onClick={() => close()}>
          {formatMessage({ id: 'src.component.ODCSetting.995A8948' /*取消*/ }) /* 取消 */}
        </Button>
        <Button onClick={reset}>
          {
            formatMessage({
              id: 'src.component.ODCSetting.82931AF2' /*恢复默认设置*/,
            }) /* 恢复默认设置 */
          }
        </Button>
        <Button type="primary" onClick={save}>
          {formatMessage({ id: 'src.component.ODCSetting.AB9A3FA4' /*保存*/ }) /* 保存 */}
        </Button>
      </Space>
    );
  }
  return (
    <Modal
      wrapClassName={styles.modal}
      width={760}
      open={modalStore.odcSettingVisible}
      onCancel={() => close()}
      title={formatMessage({ id: 'src.component.ODCSetting.AEB0A2EF' }) /*"设置"*/}
      footer={footerRender()}
    >
      <div className={styles.box}>
        <div ref={formBoxRef} className={styles.content}>
          <Form form={formRef} layout="vertical" onValuesChange={() => setChanged(true)}>
            {Array.from(data.values()).map((groupData) => {
              return (
                <React.Fragment key={groupData.key}>
                  <Typography.Title data-name={groupData.key} level={5}>
                    {groupData?.label}
                  </Typography.Title>
                  {Array.from(groupData?.secondGroup?.values()).map((group, index) => {
                    return (
                      <React.Fragment key={group.key}>
                        <Space
                          style={{ width: '100%', paddingLeft: 8, marginTop: 12 }}
                          direction="vertical"
                        >
                          {!!group.label && <Typography.Text strong>{group.label}</Typography.Text>}
                          <Row style={{ paddingLeft: 12 }} gutter={20}>
                            {group.settings.map((set, index) => {
                              if (set.hidden) {
                                return null;
                              }
                              return (
                                <Col key={index} span={set.span || 10}>
                                  <Form.Item
                                    label={
                                      <Space direction="vertical" size={2}>
                                        <Typography.Text>{set.label}</Typography.Text>
                                        {!!set.tip && (
                                          <Typography.Text type="secondary">
                                            {set.tip}
                                          </Typography.Text>
                                        )}
                                      </Space>
                                    }
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
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </Form>
        </div>
        <div className={styles.menu}>
          <Tabs
            tabBarGutter={0}
            size="small"
            moreIcon={false}
            tabPosition="right"
            items={Array.from(data.values()).map((g) => {
              return {
                label: g.label,
                key: g.key,
              };
            })}
            activeKey={activeKey}
            onChange={(key) => {
              setActiveKey(key);
              scrollToKey(key);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default inject('modalStore')(observer(ODCSetting));
