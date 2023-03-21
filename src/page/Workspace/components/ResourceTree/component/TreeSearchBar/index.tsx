import { actionTypes, WorkspaceAcess } from '@/component/Acess';
import { ConnectionMode, ResourceTabKey, SynonymType } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openBatchCompilePLPage } from '@/store/helper/page';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import CompileSvg from '@/svgr/batch-compile.svg';
import { formatMessage } from '@/util/intl';
import Icon, { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Input, Radio, Space, Tooltip } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { PL_ResourceMap } from '../../index';
import FilterPopover from '../FilterPopover';
import styles from './index.less';

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore')
@observer
export default class TreeSearchBar extends Component<
  {
    pageStore?: PageStore;
    schemaStore?: SchemaStore;
    connectionStore?: ConnectionStore;
    placeholder: string;
    title: any;
    onAddTreeNode: any;
    onRefreshTree: any;
    onSearchTreeNode: any;
    onChangeSynonymType?: (e: SynonymType) => void;
    onFilterChange?: (value: string[]) => void;
    filterValue: string[];
    value: string;
    activeResource: ResourceTabKey;
  },
  {
    loading: boolean;
    searchKey: string;
  }
> {
  public readonly state = {
    loading: false,
    searchKey: '',
  };

  private handleBatchCompile = () => {
    const { activeResource } = this.props;
    const { label, pageKey } = PL_ResourceMap[activeResource];
    openBatchCompilePLPage(pageKey, activeResource, label);
  };

  public render() {
    const {
      schemaStore: { synonymType },
      connectionStore: { connection },
      onAddTreeNode,
      onRefreshTree,
      onSearchTreeNode,
      onChangeSynonymType,
      title,
      placeholder,
      value,
      filterValue,
      activeResource,
      onFilterChange,
    } = this.props;
    const isPL = [
      ResourceTabKey.FUNCTION,
      ResourceTabKey.PROCEDURE,
      ResourceTabKey.PACKAGE,
      ResourceTabKey.TRIGGER,
      ResourceTabKey.TYPE,
    ].includes(activeResource);
    const isOracle = connection.dbMode === ConnectionMode.OB_ORACLE;
    const enableFilter = isPL && isOracle;
    // 触发器 & 类型 暂不支持 批量编译
    const enableBatchCompile =
      isPL && isOracle && ![ResourceTabKey.TRIGGER, ResourceTabKey.TYPE].includes(activeResource);

    return (
      <div className={styles.treeSearchBar}>
        <header className={styles.header}>
          <span>{title}</span>

          <Space className={styles.operate}>
            <WorkspaceAcess action={actionTypes.create}>
              <Tooltip
                title={formatMessage({
                  id: 'workspace.header.create',
                })}
              >
                <PlusOutlined onClick={onAddTreeNode} />
              </Tooltip>
            </WorkspaceAcess>
            {enableFilter && <FilterPopover filterValue={filterValue} onChange={onFilterChange} />}
            {enableBatchCompile && (
              <Tooltip
                title={formatMessage({
                  id: 'odc.component.TreeSearchBar.BatchCompilation',
                })} /*批量编译*/
              >
                <Icon component={CompileSvg} onClick={this.handleBatchCompile} />
              </Tooltip>
            )}
            <Tooltip
              title={formatMessage({
                id: 'workspace.window.session.button.refresh',
              })}
            >
              <SyncOutlined spin={false} onClick={onRefreshTree} />
            </Tooltip>
          </Space>
        </header>
        {activeResource === ResourceTabKey.SYNONYM && (
          <div className={styles.filterWrapper}>
            <Radio.Group
              defaultValue={synonymType}
              value={synonymType}
              onChange={(e: RadioChangeEvent) => {
                onChangeSynonymType(e.target.value);
              }}
            >
              <Tooltip
                title={
                  formatMessage({
                    id: 'odc.component.TreeSearchBar.CommonSynonym',
                  }) /*普通同义词*/
                }
              >
                <Radio.Button value={SynonymType.COMMON}>
                  {
                    formatMessage({
                      id: 'odc.component.TreeSearchBar.CommonSynonym',
                    })
                    /*普通同义词*/
                  }
                </Radio.Button>
              </Tooltip>
              <Tooltip
                title={
                  formatMessage({
                    id: 'odc.component.TreeSearchBar.CommonSynonyms',
                  }) /*公用同义词*/
                }
              >
                <Radio.Button value={SynonymType.PUBLIC}>
                  {
                    formatMessage({
                      id: 'odc.component.TreeSearchBar.CommonSynonyms',
                    })
                    /*公用同义词*/
                  }
                </Radio.Button>
              </Tooltip>
            </Radio.Group>
          </div>
        )}

        <div className={styles.search}>
          <Input.Search
            allowClear={true}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              onSearchTreeNode(e.target.value);
            }}
            onSearch={onSearchTreeNode}
          />
        </div>
      </div>
    );
  }
}
