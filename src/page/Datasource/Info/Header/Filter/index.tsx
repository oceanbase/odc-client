import { DatabaseAvailableTypeText, DatabaseBelongsToProjectTypeText } from '@/constant/label';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover, Space, Typography, Tooltip } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import ParamContext from '../../ParamContext';
import FilterIcon from '@/component/Button/FIlterIcon';
import {
  getIsDBAvailableInDataSourceTypes,
  getIsDBBelongsToProjectsInDataSourceTypes,
} from '@/common/datasource';
import RadioTag from '@/component/RadioTag';
import styles from '../index.less';
interface IProps {}

const Filter: React.FC<IProps> = function ({}) {
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const context = useContext(ParamContext);

  function clear() {
    context.setFilterParams({
      existed: undefined,
      belongsToProject: undefined,
    });
  }
  const { existed, belongsToProject } = context?.filterParams;

  const tipContent = () => {
    return (
      <>
        {existedTipContent}
        {belongsToProjectTipContent}
      </>
    );
  };
  const existedTipContent = useMemo(() => {
    if (!existed) return null;
    return (
      <div>
        <span>
          {formatMessage({
            id: 'src.page.Datasource.Info.Header.Filter.AB1F0599',
            defaultMessage: '数据库状态',
          })}
        </span>
        ：<span>{DatabaseAvailableTypeText[String(existed)]}</span>
      </div>
    );
  }, [existed]);

  const belongsToProjectTipContent = useMemo(() => {
    if (!belongsToProject) return null;
    return (
      <div>
        <span>
          {formatMessage({
            id: 'src.page.Datasource.Info.Header.Filter.7A10CB43',
            defaultMessage: '数据库分配',
          })}
        </span>
        ：<span>{DatabaseBelongsToProjectTypeText[String(belongsToProject)]}</span>
      </div>
    );
  }, [belongsToProject]);
  const isActive = useMemo(() => {
    return Boolean(existed || belongsToProject);
  }, [existed, belongsToProject]);
  const handleOpenChange = (value: boolean) => {
    setOpen(value);
  };

  return (
    <Popover
      placement="bottomRight"
      overlayStyle={{ width: 300 }}
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Text strong>
            {formatMessage({
              id: 'src.page.Datasource.Info.Header.Filter.881015FF',
              defaultMessage: '筛选',
            })}
          </Typography.Text>
          <a onClick={clear}>
            {formatMessage({ id: 'odc.Header.Filter.Clear', defaultMessage: '清空' }) /*清空*/}
          </a>
        </div>
      }
      content={
        <div>
          <Space direction="vertical" size={16}>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.page.Datasource.Info.Header.Filter.AB1F0599',
                  defaultMessage: '数据库状态',
                })}
              </Typography.Text>
              <RadioTag
                value={context?.filterParams?.existed}
                options={[]
                  .concat(getIsDBAvailableInDataSourceTypes())
                  .map((v) => ({ label: DatabaseAvailableTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    existed: v,
                  });
                }}
              />
            </Space>

            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.page.Datasource.Info.Header.Filter.7A10CB43',
                  defaultMessage: '数据库分配',
                })}
              </Typography.Text>
              <RadioTag
                value={context?.filterParams?.belongsToProject}
                options={[]
                  .concat(getIsDBBelongsToProjectsInDataSourceTypes())
                  .map((v) => ({ label: DatabaseBelongsToProjectTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setFilterParams({
                    ...context?.filterParams,
                    belongsToProject: v,
                  });
                }}
              />
            </Space>
          </Space>
        </div>
      }
    >
      <FilterIcon border isActive={isActive}>
        <Tooltip
          title={open ? undefined : tipContent()}
          open={!open && hover && isActive}
          overlayClassName={styles.filterTooltip}
        >
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <FilterOutlined />
          </div>
        </Tooltip>
      </FilterIcon>
    </Popover>
  );
};

export default Filter;
