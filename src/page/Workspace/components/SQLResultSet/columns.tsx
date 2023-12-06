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
import { RenderLevel } from '@/page/Secure/Env/components/InnerEnvironment';
import { Space, Popover, Button } from 'antd';
import utils, { IEditor } from '@/util/editor';
import { levelMap } from '@/page/Secure/interface';
const getColumns = (showLocate: boolean, ctx: IEditor) => {
  return [
    {
      title: formatMessage({
        id: 'odc.src.page.Workspace.components.SQLResultSet.SerialNumber',
      }), //'序号'
      dataIndex: 'row',
      key: 'row',
      width: 60,
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Workspace.components.SQLResultSet.SQLStatement',
      }), //'SQL 语句'
      dataIndex: 'sql',
      key: 'sql',
      ellipsis: {
        showTitle: true,
      },
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Workspace.components.SQLResultSet.AgainstTheRules',
      }), //'违反规则'
      dataIndex: 'rules',
      key: 'rules',
      filters: [
        {
          text: formatMessage({
            id: 'odc.src.page.Workspace.components.SQLResultSet.MustBeImproved',
          }), //'必须改进'
          value: 2,
        },
        {
          text: formatMessage({
            id: 'odc.src.page.Workspace.components.SQLResultSet.NeedApproval',
          }), //'需要审批'
          value: 1,
        },
        {
          text: formatMessage({
            id: 'odc.src.page.Workspace.components.SQLResultSet.NoNeedToImprove',
          }), //'无需改进'
          value: 0,
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
            {Object.keys(rules).map((key) => {
              return (
                <Popover
                  content={
                    <div>
                      <RenderLevel level={key} />
                      {rules?.[key]?.map((rule, index) => (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                          }}
                          key={index}
                        >
                          <div>
                            {index + 1}. {rule?.localizedMessage}
                          </div>
                          {showLocate && (
                            <Button
                              type="link"
                              onClick={() => {
                                utils.removeHighlight(ctx);
                                utils.addHighlight(
                                  ctx,
                                  rule?.start + rule?.offset,
                                  rule?.stop + rule?.offset,
                                  levelMap?.[key],
                                );
                              }}
                            >
                              {
                                formatMessage({
                                  id: 'odc.src.page.Workspace.components.SQLResultSet.Position',
                                }) /* 
                              定位
                             */
                              }
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    <RenderLevel level={key} extra={`(${rules?.[key]?.length})`} />
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
export default getColumns;
