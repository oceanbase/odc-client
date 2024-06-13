import { formatMessage } from '@/util/intl';
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
import { RiskLevelEnum, RiskLevelTextMap, levelMap } from '@/page/Secure/interface';
import utils, { IEditor } from '@/util/editor';
import { Button, Popover, Space, Tooltip } from 'antd';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import Icon from '@ant-design/icons';
import { ReactComponent as errorSvg } from '@/svgr/error.svg';
import { ReactComponent as alertSvg } from '@/svgr/alert.svg';
import { ReactComponent as safetySvg } from '@/svgr/safety.svg';
import styles from './index.less';
const getColumns = (
  showLocate: boolean,
  sqlChanged: boolean,
  ctx: IEditor,
  baseOffset?: number,
) => {
  return [
    {
      title: formatMessage({
        id: 'odc.src.page.Workspace.components.SQLResultSet.SerialNumber',
      }),
      //'序号'
      dataIndex: 'row',
      key: 'row',
      width: 60,
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Workspace.components.SQLResultSet.SQLStatement',
      }),
      //'SQL 语句'
      dataIndex: 'sql',
      key: 'sql',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Workspace.components.SQLResultSet.AgainstTheRules',
      }),
      //'违反规则'
      dataIndex: 'rules',
      key: 'rules',
      filters: [
        {
          text: <LintLabel level={RiskLevelEnum.MUST} needLevelMap noPadding />,
          value: RiskLevelEnum.MUST,
        },
        {
          text: <LintLabel level={RiskLevelEnum.SUGGEST} needLevelMap noPadding />,
          value: RiskLevelEnum.SUGGEST,
        },
        {
          text: <LintLabel level={RiskLevelEnum.DEFAULT} needLevelMap noPadding />,
          value: RiskLevelEnum.DEFAULT,
        },
      ],

      filterMultiple: true,
      onFilter: (value, record) => {
        return record?.rules.hasOwnProperty(value);
      },
      render: (text, record) => {
        const { rules = {} } = record;
        return (
          <Space>
            {Object.keys(rules).map((key, index) => {
              return (
                <Popover
                  key={index}
                  content={
                    <div>
                      <LintLabel level={key} needLevelMap extra={`(${rules?.[key]?.length})`} />
                      <div
                        style={{
                          overflowY: 'scroll',
                          maxHeight: '350px',
                        }}
                      >
                        {rules?.[key]?.map((rule, index) => (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '8px',
                              alignItems: 'baseline',
                            }}
                            key={`${index}-${index}`}
                          >
                            <div>
                              {index + 1}. {rule?.localizedMessage}
                            </div>
                            {showLocate && (
                              <Tooltip
                                title={
                                  sqlChanged
                                    ? formatMessage({
                                        id: 'odc.src.page.Workspace.components.SQLResultSet.SQLContentHasBeenModified',
                                      }) //'SQL内容已修改，已无法定位原问题行，请重新执行SQL语句或发起预检查'
                                    : ''
                                }
                              >
                                <Button
                                  type="link"
                                  style={{
                                    padding: '0px',
                                  }}
                                  disabled={sqlChanged}
                                  onClick={async () => {
                                    await utils.removeHighlight(ctx);
                                    await utils.addHighlight(
                                      ctx,
                                      rule?.start + rule?.offset + baseOffset,
                                      rule?.stop + rule?.offset + baseOffset,
                                      levelMap?.[key],
                                    );
                                    await utils.setPositionAndScroll(
                                      ctx,
                                      rule?.start + rule?.offset + baseOffset,
                                      false,
                                    );
                                  }}
                                >
                                  {formatMessage({
                                    id: 'src.page.Workspace.components.SQLResultSet.27AA04C0',
                                    defaultMessage: '定位',
                                  })}
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <div
                    style={{
                      cursor: 'pointer',
                    }}
                    className={styles.lintLabel}
                  >
                    <LintLabel level={key} extra={rules?.[key]?.length} />
                  </div>
                </Popover>
              );
            })}
          </Space>
        );
      },
    },
  ];
};

export const getMultipleAsyncColumns = (
  showLocate: boolean,
  sqlChanged: boolean,
  ctx: IEditor,
  baseOffset?: number,
) => {
  return [
    {
      title: formatMessage({
        id: 'odc.src.page.Workspace.components.SQLResultSet.SQLStatement',
      }),
      //'SQL 语句'
      dataIndex: 'sql',
      key: 'sql',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="left" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLResultSet.4F0CD429',
        defaultMessage: '执行数据库',
      }),
      dataIndex: 'databaseIds',
      key: 'databaseIds',
      width: 264,
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) => {
        const icon = getDataSourceStyleByConnectType(record?.database?.dataSource?.type);
        return (
          <Popover
            content={
              <Space size={0}>
                <RiskLevelLabel
                  content={record?.database?.environment?.name}
                  color={record?.database?.environment?.style}
                />

                <Space size={4}>
                  <Icon
                    component={icon?.icon?.component}
                    style={{
                      color: icon?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />

                  <div>{record?.database?.name}</div>
                  <div style={{ color: 'var(--neutral-black45-color)' }}>
                    {record?.database?.dataSource?.name}
                  </div>
                </Space>
              </Space>
            }
          >
            <Space size={0}>
              <RiskLevelLabel
                content={record?.database?.environment?.name}
                color={record?.database?.environment?.style}
              />

              <Space size={4}>
                <Icon
                  component={icon?.icon?.component}
                  style={{
                    color: icon?.icon?.color,
                    fontSize: 16,
                    marginRight: 4,
                  }}
                />

                <div>{record?.database?.name}</div>
                <div style={{ color: 'var(--neutral-black45-color)' }}>
                  {record?.database?.dataSource?.name}
                </div>
              </Space>
            </Space>
          </Popover>
        );
      },
    },
    {
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLResultSet.CB2CF731',
        defaultMessage: '检查结果',
      }),
      dataIndex: 'rules',
      key: 'rules',
      filters: [
        {
          text: <LintLabel level={RiskLevelEnum.MUST} needLevelMap noPadding />,
          value: RiskLevelEnum.MUST,
        },
        {
          text: <LintLabel level={RiskLevelEnum.SUGGEST} needLevelMap noPadding />,
          value: RiskLevelEnum.SUGGEST,
        },
        {
          text: <LintLabel level={RiskLevelEnum.DEFAULT} needLevelMap noPadding />,
          value: RiskLevelEnum.DEFAULT,
        },
      ],

      filterMultiple: true,
      onFilter: (value, record) => {
        return record?.rules.hasOwnProperty(value);
      },
      render: (text, record) => {
        const { rules = {} } = record;
        return (
          <Space>
            {Object.keys(rules).map((key, index) => {
              return (
                <Popover
                  key={index}
                  content={
                    <div>
                      <LintLabel level={key} needLevelMap extra={`(${rules?.[key]?.length})`} />
                      <div
                        style={{
                          overflowY: 'scroll',
                          maxHeight: '350px',
                        }}
                      >
                        {rules?.[key]?.map((rule, index) => (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '8px',
                              alignItems: 'baseline',
                            }}
                            key={`${index}-${index}`}
                          >
                            <div>
                              {index + 1}. {rule?.localizedMessage}
                            </div>
                            {showLocate && (
                              <Tooltip
                                title={
                                  sqlChanged
                                    ? formatMessage({
                                        id: 'odc.src.page.Workspace.components.SQLResultSet.SQLContentHasBeenModified',
                                      }) //'SQL内容已修改，已无法定位原问题行，请重新执行SQL语句或发起预检查'
                                    : ''
                                }
                              >
                                <Button
                                  type="link"
                                  style={{
                                    padding: '0px',
                                  }}
                                  disabled={sqlChanged}
                                  onClick={async () => {
                                    await utils.removeHighlight(ctx);
                                    await utils.addHighlight(
                                      ctx,
                                      rule?.start + rule?.offset + baseOffset,
                                      rule?.stop + rule?.offset + baseOffset,
                                      levelMap?.[key],
                                    );
                                    await utils.setPositionAndScroll(
                                      ctx,
                                      rule?.start + rule?.offset + baseOffset,
                                      false,
                                    );
                                  }}
                                >
                                  {formatMessage({
                                    id: 'src.page.Workspace.components.SQLResultSet.3753C098',
                                    defaultMessage: '定位',
                                  })}
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <div
                    style={{
                      cursor: 'pointer',
                    }}
                    className={styles.lintLabel}
                  >
                    <LintLabel level={key} extra={rules?.[key]?.length} />
                  </div>
                </Popover>
              );
            })}
          </Space>
        );
      },
    },
  ];
};
export const LintResultIcon: React.FC<{
  level: string;
}> = ({ level }) => {
  switch (parseInt?.(level)) {
    case RiskLevelEnum.DEFAULT: {
      return <Icon component={safetySvg} />;
    }
    case RiskLevelEnum.SUGGEST: {
      return <Icon component={errorSvg} />;
    }
    case RiskLevelEnum.MUST: {
      return <Icon component={alertSvg} />;
    }
    default: {
      return null;
    }
  }
};

export const LintLabel: React.FC<{
  level: number | string;
  extra?: React.ReactNode;
  needLevelMap?: boolean;
  noPadding?: boolean;
}> = ({ level = -1, needLevelMap = false, extra = '', noPadding = false }) => {
  return (
    <Space
      size={4}
      style={{
        minWidth: '42px',
        padding: noPadding ? 0 : 4,
      }}
    >
      <div>
        <LintResultIcon level={'' + level} />
      </div>
      {level !== -1 && needLevelMap && <div>{RiskLevelTextMap?.[level]}</div>}
      {extra}
    </Space>
  );
};
export default getColumns;
