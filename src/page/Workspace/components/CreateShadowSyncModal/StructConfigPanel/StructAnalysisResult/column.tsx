import { SchemaComparingResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Space, TableColumnsType } from 'antd';
import React, { useMemo } from 'react';
import {
  IShadowSyncAnalysisResult,
  SchemaSyncExecuteStatus,
  SchemaSyncExecuteStatusText,
  SchemaSyncExecutingRecord,
  ShadowTableSyncTaskResult,
} from '../../interface';

import { SchemaComparingResultText } from '@/constant/label';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EllipsisOutlined,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';

const ExecuteStatus: React.FC<{ status: SchemaSyncExecuteStatus }> = function ({ status }) {
  switch (status) {
    case SchemaSyncExecuteStatus.WAITING: {
      return (
        <Space>
          <EllipsisOutlined
            style={{
              color: '#ffffff',
              background: 'var(--icon-orange-color)',
              borderRadius: '14px',
              padding: 1,
              fontSize: 13,
            }}
          />

          {SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.WAITING]}
        </Space>
      );
    }
    case SchemaSyncExecuteStatus.EXECUTING: {
      return (
        <Space>
          <LoadingOutlined style={{ color: 'var(--icon-blue-color)' }} />
          {SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.EXECUTING]}
        </Space>
      );
    }
    case SchemaSyncExecuteStatus.SUCCESS: {
      return (
        <Space>
          <CheckCircleFilled style={{ color: 'var(--icon-green-color)' }} />
          {SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.SUCCESS]}
        </Space>
      );
    }
    case SchemaSyncExecuteStatus.FAILED: {
      return (
        <Space>
          <CloseCircleFilled style={{ color: '#f5222d' }} />
          {SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.FAILED]}
        </Space>
      );
    }
    case SchemaSyncExecuteStatus.SKIP: {
      return (
        <Space>
          <StopFilled style={{ color: 'var(--icon-purple-color)' }} />
          {SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.SKIP]}
        </Space>
      );
    }
    default: {
      return <span>-</span>;
    }
  }
};

export function useColumns(
  isSync: boolean,
  { skip, cancelSkip, viewResult },
  resultData: ShadowTableSyncTaskResult,
): TableColumnsType<IShadowSyncAnalysisResult['tables'][number]> {
  const isViewMode = !!resultData;
  const resultMap: Map<string, SchemaSyncExecutingRecord> = useMemo(() => {
    const map = new Map();
    resultData?.tables?.forEach((table) => {
      map.set(table.originTableName, table);
    });
    return map;
  }, [resultData?.tables]);
  return [
    {
      key: 'originTableName',
      dataIndex: 'originTableName',
      title: formatMessage({
        id: 'odc.StructConfigPanel.StructAnalysisResult.column.SourceTable',
      }), //源表
      width: 115,
      render(a) {
        return <span style={{ wordBreak: 'break-all' }}>{a}</span>;
      },
    },

    {
      key: 'destTableName',
      dataIndex: 'destTableName',
      title: formatMessage({
        id: 'odc.StructConfigPanel.StructAnalysisResult.column.ShadowTable',
      }), //影子表
      render(a) {
        return <span style={{ wordBreak: 'break-all' }}>{a}</span>;
      },
    },

    {
      key: 'comparingResult',
      dataIndex: 'comparingResult',
      title: formatMessage({
        id: 'odc.StructConfigPanel.StructAnalysisResult.column.AnalysisResults',
      }), //分析结果
      width: 115,
      filters: isSync
        ? [
            {
              text: SchemaComparingResultText[SchemaComparingResult.CREATE],
              value: SchemaComparingResult.CREATE,
            },

            {
              text: SchemaComparingResultText[SchemaComparingResult.UPDATE],
              value: SchemaComparingResult.UPDATE,
            },
          ]
        : [
            {
              text: SchemaComparingResultText[SchemaComparingResult.NO_ACTION],
              value: SchemaComparingResult.NO_ACTION,
            },

            {
              text: SchemaComparingResultText[SchemaComparingResult.SKIP],
              value: SchemaComparingResult.SKIP,
            },

            {
              text: SchemaComparingResultText[SchemaComparingResult.WAITING],
              value: SchemaComparingResult.WAITING,
            },

            {
              text: SchemaComparingResultText[SchemaComparingResult.COMPARING],
              value: SchemaComparingResult.COMPARING,
            },
          ],

      onFilter(v, row) {
        return v === row.comparingResult;
      },
      render(v) {
        return SchemaComparingResultText[v] || '-';
      },
    },

    isSync && resultData
      ? {
          key: 'executeResult',
          dataIndex: 'executeResult',
          title: formatMessage({
            id: 'odc.StructConfigPanel.StructAnalysisResult.column.ExecutionResult',
          }), //执行结果
          width: 115,
          filters: [
            {
              text: SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.WAITING],
              value: SchemaSyncExecuteStatus.WAITING,
            },

            {
              text: SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.EXECUTING],
              value: SchemaSyncExecuteStatus.EXECUTING,
            },

            {
              text: SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.SUCCESS],
              value: SchemaSyncExecuteStatus.SUCCESS,
            },

            {
              text: SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.FAILED],
              value: SchemaSyncExecuteStatus.FAILED,
            },

            {
              text: SchemaSyncExecuteStatusText[SchemaSyncExecuteStatus.SKIP],
              value: SchemaSyncExecuteStatus.SKIP,
            },
          ],

          onFilter(v, row) {
            return v === resultMap.get(row.originTableName)?.status;
          },
          render: (_, row) => {
            if (isSync) {
              return <ExecuteStatus status={resultMap.get(row.originTableName)?.status} />;
            } else {
              return '-';
            }
          },
        }
      : null,
    {
      key: 'actions',
      dataIndex: 'actions',
      title: formatMessage({
        id: 'odc.StructConfigPanel.StructAnalysisResult.column.Operation',
      }), //操作
      width: 110,
      render(_, row) {
        const detailBtn = (
          <a
            onClick={() => {
              viewResult(row);
            }}
          >
            {
              formatMessage({
                id: 'odc.StructConfigPanel.StructAnalysisResult.column.View',
              }) /*查看*/
            }
          </a>
        );

        const skipBtn =
          skip && !isViewMode ? (
            <a
              onClick={() => {
                skip([row.id]);
              }}
            >
              {
                formatMessage({
                  id: 'odc.StructConfigPanel.StructAnalysisResult.column.Skip',
                }) /*跳过*/
              }
            </a>
          ) : null;
        const cancelskipBtn =
          cancelSkip && !isViewMode ? (
            <a
              onClick={() => {
                cancelSkip([row.id]);
              }}
            >
              {
                formatMessage({
                  id: 'odc.StructConfigPanel.StructAnalysisResult.column.CancelSkip',
                }) /*取消跳过*/
              }
            </a>
          ) : null;
        if (isSync) {
          return (
            <Space>
              {detailBtn}
              {skipBtn}
            </Space>
          );
        }
        return (
          <Space>
            {detailBtn}
            {row.comparingResult === SchemaComparingResult.SKIP ? cancelskipBtn : null}
          </Space>
        );
      },
    },
  ].filter(Boolean);
}
