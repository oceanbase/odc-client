import { getMaskPolicyExists } from '@/common/network/mask';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Dropdown, Input, Menu, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

interface IMenu {
  key: string;
  id?: number;
  name: string;
  isPlus?: boolean;
  isEdit?: boolean;
}

interface IActionMenuProps {
  menu: IMenu;
  menus: IMenu[];
  hasChange: boolean;
  onRename: (menu: IMenu) => void;
  onNameChange: (menu: IMenu) => void;
  onCopy: (menu: IMenu) => void;
  onRemove: (menu: IMenu) => void;
}

const ActionMenu: React.FC<IActionMenuProps> = (props) => {
  const { menu, menus, hasChange, onRename, onCopy, onRemove, onNameChange } = props;
  const { name, key, isPlus, isEdit } = menu;
  const [value, setValue] = useState(name);
  const [error, setError] = useState(null);
  const inputProps = error
    ? {
        status: 'error',
        suffix: (
          <Tooltip title={error}>
            <ExclamationCircleFilled style={{ color: 'red' }} />
          </Tooltip>
        ),
      }
    : {};

  const handleChange = (e) => {
    setError(null);
    setValue(e.target.value);
  };

  const handleValidate = async (value: string) => {
    const someKey = menus.find((item) => item.name === value)?.key;
    let error = '';
    if (!value?.length) {
      error = formatMessage({
        id: 'odc.component.MaskPolicyManager.actionMenu.EnterAPolicyName',
      }); //请输入策略名称
    } else if (value?.trim()?.length !== value?.length) {
      error = formatMessage({
        id: 'odc.component.MaskPolicyManager.actionMenu.ThePolicyNameContainsSpaces',
      }); //策略名称首尾包含空格
    } else if (value?.length > 64) {
      error = formatMessage({
        id: 'odc.component.MaskPolicyManager.actionMenu.NoMoreThanCharacters.1',
      }); //不超过64个字符
    } else if (isEdit && someKey && someKey === key) {
      error = '';
    } else if (someKey && someKey !== key) {
      error = formatMessage({
        id: 'odc.component.MaskPolicyManager.actionMenu.ThePolicyNameAlreadyExists',
      }); //策略名称已存在
    } else {
      const validate = await getMaskPolicyExists(value);
      if (validate)
        error = formatMessage({
          id: 'odc.component.MaskPolicyManager.actionMenu.ThePolicyNameAlreadyExists',
        }); //策略名称已存在
    }
    return error;
  };

  const handleOk = async () => {
    const error = await handleValidate(value);
    if (error) {
      setError(error);
    } else {
      onNameChange({
        ...menu,
        name: value,
      });
    }
  };

  return (
    <>
      {isEdit || isPlus ? (
        // @ts-ignore
        <Input
          autoFocus
          value={value}
          onChange={handleChange}
          onBlur={handleOk}
          onPressEnter={handleOk}
          {...inputProps}
        />
      ) : (
        <div className={styles.operation}>
          <Typography.Text ellipsis>{name}</Typography.Text>
          {!hasChange && (
            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu mode="horizontal">
                  <Menu.Item key="rename">
                    <span
                      className={styles.action}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(menu);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.component.MaskPolicyManager.actionMenu.Rename',
                        })
                        /*重命名*/
                      }
                    </span>
                  </Menu.Item>
                  <Menu.Item key="copy">
                    <span
                      className={styles.action}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(menu);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.component.MaskPolicyManager.actionMenu.Copy',
                        })
                        /*复制*/
                      }
                    </span>
                  </Menu.Item>
                  <Menu.Item key="remove">
                    <span
                      className={styles.action}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(menu);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.component.MaskPolicyManager.actionMenu.Delete',
                        })
                        /*删除*/
                      }
                    </span>
                  </Menu.Item>
                </Menu>
              }
            >
              <div className={styles.label}>...</div>
            </Dropdown>
          )}
        </div>
      )}
    </>
  );
};

export default ActionMenu;
