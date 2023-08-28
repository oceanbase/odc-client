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

import { IOrganization } from '@/d.ts';
import { SpaceType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
import PersonalSvg from '@/svgr/personal_space.svg';
import GroupSvg from '@/svgr/project_space.svg';
import { formatMessage } from '@/util/intl';
import Icon, { CheckOutlined, ExclamationCircleFilled, SwapOutlined } from '@ant-design/icons';
import { Checkbox, Modal, Select, Space, Typography } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { history } from '@umijs/max';
import styles from './index.less';
import tracert from '@/util/tracert';

const ORGANIZATION_TIP_VSIBLE_KEY = 'odc_organization_tip_visible';
interface ISpaceSelect {
  collapsed: boolean;
  userStore?: UserStore;
}
const SpaceSelect: React.FC<ISpaceSelect> = (props) => {
  const { collapsed, userStore } = props;

  const handleOk = async (ori: IOrganization) => {
    const isSuccess = await userStore?.switchCurrentOrganization(ori.id);
    if (!isSuccess) {
      return;
    }
    if (ori?.type === SpaceType.SYNERGY) {
      tracert.click('a3112.b46782.c330848.d367359');
      history.push('/project');
    } else {
      tracert.click('a3112.b46782.c330848.d367360');
    }
  };

  const handleChange = async (oriId: number) => {
    const ori = userStore?.organizations?.find((item) => item.id == oriId);
    const tipVisible = localStorage.getItem(ORGANIZATION_TIP_VSIBLE_KEY);
    if (tipVisible !== 'no') {
      Modal.confirm({
        title: formatMessage(
          {
            id: 'odc.Sider.SpaceSelect.AreYouSureYouWant',
          },
          { oriDisplayName: ori.displayName },
        ), //`确认要切换为${ori.displayName}吗`
        icon: <ExclamationCircleFilled />,
        content: (
          <>
            <Typography.Paragraph>{ori.description}</Typography.Paragraph>
            <Checkbox
              onChange={(e) => {
                const value = e.target.checked ? 'no' : 'yes';
                localStorage.setItem(ORGANIZATION_TIP_VSIBLE_KEY, value);
              }}
            >
              {formatMessage({ id: 'odc.Sider.SpaceSelect.NoMorePrompt' }) /*不再提示*/}
            </Checkbox>
          </>
        ),

        okText: formatMessage({ id: 'odc.Sider.SpaceSelect.Ok' }), //确定
        cancelText: formatMessage({ id: 'odc.Sider.SpaceSelect.Cancel' }), //取消
        onOk: () => {
          handleOk(ori);
        },
      });
    } else {
      handleOk(ori);
    }
  };
  const isSpaceInArray = !!userStore.organizations?.find((o) => o.id === userStore?.organizationId);

  return (
    <Select
      className={classNames(styles['space-switch'], {
        [styles.collapsed]: collapsed,
      })}
      onDropdownVisibleChange={(v) => {
        if (v) {
          tracert.expo('a3112.b46782.c330848');
        }
      }}
      value={userStore?.organizationId}
      suffixIcon={<SwapOutlined />}
      dropdownMatchSelectWidth={144}
      style={{ width: collapsed ? 30 : 144 }}
      bordered={false}
      menuItemSelectedIcon={<CheckOutlined />}
      onChange={handleChange}
      options={userStore.organizations
        ?.map((item) => {
          return {
            value: item.id,
            label:
              item.type === SpaceType.PRIVATE ? (
                <Space>
                  <div className={styles.private}>
                    <Icon component={PersonalSvg} />
                  </div>
                  <span>{item.displayName || '-'}</span>
                </Space>
              ) : (
                <Space>
                  <div className={styles.synergy}>
                    <Icon component={GroupSvg} />
                  </div>
                  <span>{item.displayName || '-'}</span>
                </Space>
              ),
          };
        })
        .concat(isSpaceInArray ? [] : { value: userStore?.organizationId, label: <span>-</span> })}
    />
  );
};

export default inject('userStore')(observer(SpaceSelect));
