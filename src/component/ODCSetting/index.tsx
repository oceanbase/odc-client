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
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Space,
  Tabs,
  Typography,
} from 'antd';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import odcSetting, {
  IODCSetting,
  odcGroupSetting,
  odcPersonSetting,
  ODCSettingGroup,
  odcSettingMap,
} from './config';

import { ModalStore } from '@/store/modal';
import setting from '@/store/setting';
import { getODCSetting, saveODCSetting } from '@/util/client';
import { isClient } from '@/util/env';
import { encrypt, safeParseJson } from '@/util/utils';
import { inject, observer } from 'mobx-react';
import styles from './index.less';
import odc from '@/plugins/odc';
import login from '@/store/login';

interface IProps {
  modalStore?: ModalStore;
}

const { Search } = Input;

enum ESpaceType {
  USER = 'user',
  GROUP = 'group',
  PERSONAL = 'personal',
}

const settingMap = {
  [ESpaceType.USER]: odcSetting,
  [ESpaceType.GROUP]: odcGroupSetting,
  [ESpaceType.PERSONAL]: odcPersonSetting,
};

type TSetting = Map<
  string,
  ODCSettingGroup & {
    secondGroup: Map<
      string,
      ODCSettingGroup & {
        settings: IODCSetting[];
      }
    >;
  } & {
    settings: IODCSetting[];
  }
>;

const ODCSetting: React.FC<IProps> = ({ modalStore }) => {
  const [formRef] = Form.useForm();
  const [spaceFormRef] = Form.useForm();
  const [changed, setChanged] = useState(false);
  const formBoxRef = React.createRef<HTMLDivElement>();
  const scrollSwitcher = useRef<Boolean>(true);
  const [spaceType, setSpaceType] = useState(ESpaceType.USER);
  const isAdmin = odc.appConfig.manage.user.isAdmin(login.user);
  const [searchValue, setSearchValue] = useState('');

  const getData = useCallback(
    (type: ESpaceType) => {
      const result = new Map<
        string,
        ODCSettingGroup & {
          secondGroup: Map<
            string,
            ODCSettingGroup & {
              settings: IODCSetting[];
            }
          >;
        } & {
          settings: IODCSetting[];
        }
      >();
      settingMap[type].forEach((setting) => {
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
            settings: [],
          });
        }
        const groupItem = result.get(group.key);
        if (groupItem.secondGroup && secondGroup) {
          if (!groupItem.secondGroup.has(secondGroup.key)) {
            groupItem.secondGroup.set(secondGroup.key, {
              ...secondGroup,
              settings: [],
            });
          }
          const secondGroupItem = groupItem.secondGroup.get(secondGroup.key);
          secondGroupItem.settings.push(setting);
        } else {
          groupItem.settings.push(setting);
        }
      });
      return result;
    },
    [odcSetting],
  );

  const userData = useMemo(() => {
    return getData(ESpaceType.USER);
  }, []);

  const spaceUserData = useMemo(() => {
    return getData(isAdmin ? ESpaceType.GROUP : ESpaceType.PERSONAL);
  }, []);

  const data = useMemo(() => {
    return spaceType === ESpaceType.USER ? userData : spaceUserData;
  }, [spaceType]);

  const dataKeys = useMemo(() => {
    const secondKeys = [];

    const keys = Array.from(data.values()).map((g) => {
      const secondGroupItems = [...g.secondGroup.values()].map((item) => ({
        key: item.key,
        label: item.label,
        parentKey: g.key,
      }));
      secondKeys.push(...secondGroupItems);
      return {
        label: g.label,
        key: g.key,
      };
    });
    return [...keys, ...secondKeys];
  }, [data]);

  const [activeKey, setActiveKey] = useState(data.keys().next().value);

  const initState = useCallback(() => {
    const initKey = data.keys().next().value;
    if (searchValue) {
      const foundKey = searchKeys();
      if (foundKey) return;
    }
    scrollToKey(initKey);
    setActiveKey(initKey);
  }, [data]);

  useEffect(() => {
    initState();
  }, [spaceType]);

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
      // console.log(children);
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
        title: formatMessage({
          id: 'src.component.ODCSetting.983C51BC',
          defaultMessage: '确认要取消修改配置吗？',
        }), //'确认要取消修改配置吗？'
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

    let spaceData = setting.spaceConfigurations || {};
    spaceFormRef.setFieldsValue(spaceData);
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
    const spaceValues = await spaceFormRef.validateFields();
    const serverData: Record<string, string> = {},
      localData = {};
    const spaceServerData: Record<string, string> = {};
    Object.keys(values).forEach((key) => {
      const info = odcSettingMap[key];
      switch (info.storeType) {
        case 'server': {
          serverData[key] = values[key] || '';
          break;
        }
        case 'local': {
          localData[key] = values[key];
          break;
        }
      }
    });

    Object.keys(spaceValues).forEach((key) => {
      const info = odcSettingMap[key];
      switch (info.storeType) {
        case 'server': {
          spaceServerData[key] = spaceValues[key];
          break;
        }
        case 'local': {
          localData[key] = spaceValues[key];
          break;
        }
      }
    });
    if (
      serverData['odc.editor.shortcut.executeStatement'] ===
      serverData['odc.editor.shortcut.executeCurrentStatement']
    ) {
      message.warning(
        formatMessage({
          id: 'src.component.ODCSetting.CFC0C3E8',
          defaultMessage: '快捷键冲突, 请重新输入。',
        }),
      );
      return;
    }
    spaceServerData['odc.sqlexecute.default.secretKey'] = encrypt(
      spaceServerData['odc.sqlexecute.default.secretKey'],
    );
    /**
     * submit serverData
     */
    const isSuccess = await setting.updateUserConfig(serverData as any);
    const isSpaceSaved = await setting.updateSpaceConfig(spaceServerData as any);
    /**
     * submit localData
     */
    if (isClient()) {
      await saveODCSetting(JSON.stringify(localData));
    }
    if (isSuccess && isSpaceSaved) {
      message.success(
        formatMessage({
          id: 'src.component.ODCSetting.E6DD81BF' /*'保存成功'*/,
          defaultMessage: '保存成功',
        }),
      );
      close(true);
    }
  }

  function reset() {
    Modal.confirm({
      title: formatMessage({
        id: 'src.component.ODCSetting.647A18AA',
        defaultMessage: '确定要恢复默认设置吗？',
      }), //'确定要恢复默认设置吗？'
      onOk: async () => {
        const isSuccess = await setting.resetUserConfig();
        const isSpaceReset = await setting.resetSpaceConfig();
        if (isSuccess && isSpaceReset) {
          message.success(
            formatMessage({
              id: 'src.component.ODCSetting.654799D1' /*'已恢复到默认配置'*/,
              defaultMessage: '已恢复到默认配置',
            }),
          );
          close(true);
        }
      },
    });
  }

  function formRender({
    currentRef,
    data,
    hidden,
  }: {
    currentRef: FormInstance<any>;
    data: TSetting;
    hidden: boolean;
  }) {
    return (
      <Form
        form={currentRef}
        layout="vertical"
        onValuesChange={() => setChanged(true)}
        hidden={hidden}
      >
        {Array.from(data.values()).map((groupData) => {
          return (
            <React.Fragment key={groupData.key}>
              <Typography.Title data-name={groupData.key} level={5}>
                {groupData?.label}
              </Typography.Title>
              {groupData?.secondGroup.size > 0 ? (
                Array.from(groupData?.secondGroup?.values()).map((group, index) => {
                  return (
                    <React.Fragment key={group.key}>
                      <Space
                        style={{ width: '100%', paddingLeft: 8, marginTop: 12 }}
                        direction="vertical"
                      >
                        {!!group.label && (
                          <Typography.Text data-name={group.key} strong>
                            {group.label}
                          </Typography.Text>
                        )}
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
                                  rules={set.rules}
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
                })
              ) : (
                <Space
                  style={{ width: '100%', paddingLeft: 8, marginTop: 9 }}
                  direction="vertical"
                  size={'small'}
                >
                  {groupData.settings.map((set, index) => {
                    if (set.hidden) {
                      return null;
                    }
                    return (
                      <Form.Item
                        style={{ marginBottom: 12 }}
                        label={
                          <Space direction="vertical" size={2}>
                            <Typography.Text>{set.label}</Typography.Text>
                            {!!set.tip && (
                              <Typography.Text type="secondary">{set.tip}</Typography.Text>
                            )}
                          </Space>
                        }
                        name={set.key}
                        key={set.key}
                        rules={set.rules}
                      >
                        {set.render(null, async () => {})}
                      </Form.Item>
                    );
                  })}{' '}
                </Space>
              )}
            </React.Fragment>
          );
        })}
      </Form>
    );
  }

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const searchKeys = useCallback(() => {
    const filtered = dataKeys.filter((item) =>
      item.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
    if (filtered.length > 0) {
      setActiveKey(filtered[0].parentKey || filtered[0].key);
      scrollToKey(filtered[0].key);
      return true;
    }
    return false;
  }, [dataKeys]);

  const handleEnterPress = (e) => {
    if (e.key === 'Enter') {
      const filtered = dataKeys.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase()),
      );
      if (filtered.length > 0) {
        setActiveKey(filtered[0].parentKey || filtered[0].key);
        scrollToKey(filtered[0].key);
      }
    }
  };

  function tabRender({ data }: { data: TSetting }) {
    return (
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
    );
  }

  function footerRender() {
    return (
      <Space>
        <Button onClick={() => close()}>
          {
            formatMessage({
              id: 'src.component.ODCSetting.995A8948' /*取消*/,
              defaultMessage: '取消',
            }) /* 取消 */
          }
        </Button>
        <Button onClick={reset}>
          {
            formatMessage({
              id: 'src.component.ODCSetting.82931AF2' /*恢复默认设置*/,
              defaultMessage: '恢复默认设置',
            }) /* 恢复默认设置 */
          }
        </Button>
        <Button type="primary" onClick={save}>
          {
            formatMessage({
              id: 'src.component.ODCSetting.AB9A3FA4' /*保存*/,
              defaultMessage: '保存',
            }) /* 保存 */
          }
        </Button>
      </Space>
    );
  }
  return (
    <Modal
      wrapClassName={styles.modal}
      width={700}
      destroyOnClose
      open={modalStore.odcSettingVisible}
      onCancel={() => close()}
      title={
        formatMessage({
          id: 'src.component.ODCSetting.AEB0A2EF',
          defaultMessage: '设置',
        }) /*"设置"*/
      }
      footer={footerRender()}
    >
      <div className={styles.settingHeader}>
        <Radio.Group
          className={styles.tabs}
          defaultValue={ESpaceType.USER}
          onChange={(e) => setSpaceType(e.target.value)}
        >
          <Radio.Button className={styles.user} value={ESpaceType.USER}>
            用户
          </Radio.Button>
          {login.isPrivateSpace() ? (
            <Radio.Button className={styles.space} value={ESpaceType.PERSONAL}>
              个人空间
            </Radio.Button>
          ) : isAdmin ? (
            <Radio.Button className={styles.space} value={ESpaceType.GROUP}>
              团队空间
            </Radio.Button>
          ) : null}
        </Radio.Group>
        <Search
          className={styles.search}
          placeholder="搜索设置项"
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          onPressEnter={handleEnterPress}
          value={searchValue}
        />
      </div>
      <div className={styles.box}>
        <div ref={formBoxRef} className={styles.content}>
          {formRender({
            currentRef: formRef,
            data: userData,
            hidden: spaceType !== ESpaceType.USER,
          })}
          {formRender({
            currentRef: spaceFormRef,
            data: spaceUserData,
            hidden: spaceType === ESpaceType.USER,
          })}
        </div>
        <div className={styles.menu}>
          {tabRender({ data: spaceType === ESpaceType.USER ? userData : spaceUserData })}
        </div>
      </div>
    </Modal>
  );
};

export default inject('modalStore')(observer(ODCSetting));
