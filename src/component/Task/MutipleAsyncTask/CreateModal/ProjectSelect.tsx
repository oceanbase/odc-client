import { formatMessage } from '@/util/intl';
import { Empty, Form, Popover, Select, Tooltip } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import _ from 'lodash';
import classNames from 'classnames';

const ProjectSelect = ({ projectMap, projectOptions }) => {
  const form = Form.useFormInstance();
  const projectId = Form.useWatch('projectId', form);
  const [searchValue, setSearchValue] = useState<string>();
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const renderOptions = searchValue?.trim()?.length
    ? projectOptions?.filter((item) => {
        if (item?.label?.toString()?.toLowerCase()?.indexOf(searchValue?.toLowerCase()) > -1) {
          return item;
        }
      })
    : projectOptions;

  const renderItem = (item, setSearchValue) => {
    const isCurrent = item?.value === projectId;
    return (
      <div
        title={item?.label}
        key={item?.value}
        data-key={item?.value}
        onClick={() => {
          if (item?.disabled) {
            return;
          }
          setSearchValue('');
          form.setFieldValue(['projectId'], item?.value);
          setPopoverOpen(false);
        }}
      >
        <Tooltip title={item?.disabled ? '暂无权限，请先申请数据库权限' : null} placement="left">
          <div
            className={classNames(styles.option, {
              [styles.optionDisabled]: item?.disabled,
            })}
            style={{
              backgroundColor: isCurrent ? '#e6f4ff' : null,
            }}
          >
            <div
              style={{
                color: item?.disabled
                  ? 'var(--mask-color)'
                  : isCurrent
                  ? 'black'
                  : 'var(--text-color-primary)',
              }}
            >
              {item?.label}
            </div>
          </div>
        </Tooltip>
      </div>
    );
  };

  const getPlaceholder = () => {
    if (!projectId) {
      return '请选择项目';
    }
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ color: 'var(--text-color-primary)' }}>{projectMap?.[projectId]}</div>
      </div>
    );
  };
  return (
    <Form.Item
      label={
        formatMessage({
          id: 'odc.src.component.Task.ApplyPermission.CreateModal.Project',
        }) /* 项目 */
      }
      name="projectId"
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProject',
          }), //'请选择项目'
        },
      ]}
    >
      <Popover
        trigger="click"
        placement="bottom"
        showArrow={false}
        overlayStyle={{
          width: '390px',
          padding: 0,
        }}
        open={popoverOpen}
        onOpenChange={(open) => setPopoverOpen(open)}
        overlayInnerStyle={{
          padding: 0,
        }}
        overlayClassName={styles.selectOptions}
        content={
          renderOptions?.length ? (
            <div
              style={{
                maxHeight: '320px',
                overflow: 'hidden scroll',
                scrollbarWidth: 'none',
              }}
            >
              {renderOptions?.map((item) => renderItem(item, setSearchValue))}
            </div>
          ) : (
            <div
              style={{
                width: '390px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )
        }
      >
        <Select
          showSearch
          optionFilterProp="title"
          style={{ width: 390 }}
          searchValue={searchValue}
          onSearch={(searchValue) => setSearchValue(searchValue)}
          placeholder={getPlaceholder()}
          allowClear
          open={false}
        />
      </Popover>
    </Form.Item>
  );
};

export default ProjectSelect;
