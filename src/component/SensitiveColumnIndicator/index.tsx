/**
 * 敏感列标识组件
 * 用于在表结构查看和SQL执行结果中显示敏感列信息
 */
import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Space, Typography, Button, Tag } from 'antd';
import { EyeInvisibleOutlined, SecurityScanOutlined, SyncOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import sensitiveColumnScanner, { IScanResult } from '@/service/sensitiveColumnScanner';
import { ISensitiveColumnInfo } from '@/d.ts/sensitiveColumn';
import styles from './index.less';

interface ISensitiveColumnIndicatorProps {
  /** 敏感列信息列表 - 如果提供则直接使用，否则从扫描服务获取 */
  sensitiveColumns?: ISensitiveColumnInfo[];
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 组件大小 */
  size?: 'small' | 'default' | 'large';
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 表名 - 用于触发扫描 */
  tableName?: string;
  /** 数据库名 - 用于触发扫描 */
  databaseName?: string;
  /** 会话ID - 用于触发扫描 */
  sessionId?: string;
  /** 列信息 - 用于扫描 */
  columns?: Array<{ columnName?: string; name?: string; columnType?: string; typeName?: string }>;
  /** 触发来源 */
  triggerSource?: 'TABLE_VIEW' | 'SQL_RESULT';
  /** 是否自动触发扫描 */
  autoScan?: boolean;
}

// 敏感等级配置
const SENSITIVITY_CONFIG = {
  HIGH: {
    color: '#ff4d4f',
    text: '高敏感',
    icon: <SecurityScanOutlined />,
  },
  MEDIUM: {
    color: '#faad14',
    text: '中敏感',
    icon: <EyeInvisibleOutlined />,
  },
  LOW: {
    color: '#52c41a',
    text: '低敏感',
    icon: <EyeInvisibleOutlined />,
  },
};

const SensitiveColumnIndicator: React.FC<ISensitiveColumnIndicatorProps> = ({
  sensitiveColumns: propSensitiveColumns,
  showDetails = false,
  size = 'default',
  className,
  style,
  tableName,
  databaseName,
  sessionId,
  columns,
  triggerSource = 'TABLE_VIEW',
  autoScan = false,
}) => {
  const [scanResult, setScanResult] = useState<IScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // 使用传入的敏感列数据或扫描结果
  const sensitiveColumns = propSensitiveColumns || scanResult?.sensitiveColumns || [];

  // 触发扫描
  const triggerScan = async (forceRescan = false) => {
    if (!tableName || !databaseName || !sessionId) {
      console.warn('缺少扫描参数:', { tableName, databaseName, sessionId });
      setScanError('缺少必要的扫描参数');
      return;
    }

    // 如果是强制重新扫描，清除缓存
    if (forceRescan) {
      sensitiveColumnScanner.clearCache(tableName, databaseName);
    }

    // 如果是重试，设置重试状态
    if (scanError) {
      setIsRetrying(true);
      setRetryCount((prev) => prev + 1);
    } else {
      setRetryCount(0);
    }

    setIsScanning(true);
    setScanError(null); // 清除之前的错误
    try {
      // 格式化列数据为 IServerTableColumn 类型
      const formattedColumns =
        columns?.map((column, index) => ({
          name: column.name || column.columnName || '',
          typeName: column.typeName || column.columnType || 'VARCHAR',
          fullTypeName: column.typeName || column.columnType || 'VARCHAR',
          schemaName: databaseName,
          tableName: tableName,
          ordinalPosition: index + 1,
          nullable: true,
          autoIncrement: false,
          defaultValue: '',
          comment: '',
          virtual: false,
          scale: 0,
          precision: 0,
          typeModifiers: [],
          maxLength: 0,
          charsetName: '',
          collationName: '',
          genExpression: '',
          unsigned: false,
          zerofill: false,
          enumValues: [],
          stored: false,
          onUpdateCurrentTimestamp: false,
          extraInfo: '',
          charUsed: 'BYTE' as const,
          hidden: false,
          warning: '',
          keyType: undefined,
          secondPrecision: undefined,
          dayPrecision: undefined,
          yearPrecision: undefined,
        })) || [];

      const result = await sensitiveColumnScanner.scanSensitiveColumns({
        tableName,
        databaseName,
        sessionId,
        columns: formattedColumns,
        triggerSource,
      });

      if (result) {
        setScanResult(result);
        setScanError(null);
      } else {
        setScanError('扫描失败，请稍后重试');
      }
    } catch (error) {
      console.error('扫描失败:', error);
      setScanError(error?.message || '扫描过程中发生错误');
    } finally {
      setIsScanning(false);
      setIsRetrying(false);
    }
  };

  // 自动扫描
  useEffect(() => {
    if (autoScan && tableName && databaseName && sessionId && !propSensitiveColumns) {
      // 检查是否有缓存结果
      const cached = sensitiveColumnScanner.getCachedResult(tableName, databaseName);
      if (cached) {
        setScanResult(cached);
      } else {
        triggerScan();
      }
    }
  }, [autoScan, tableName, databaseName, sessionId, propSensitiveColumns]);

  // 监听缓存清除事件
  useEffect(() => {
    if (!tableName || !databaseName || !autoScan) {
      return;
    }

    const handleCacheChange = (clearedTableName: string, clearedDatabaseName: string) => {
      // 如果清除的是当前表的缓存，触发重新扫描
      if (clearedTableName === tableName && clearedDatabaseName === databaseName) {
        console.log(`检测到表 ${tableName} 缓存被清除，触发重新扫描`);
        // 清除当前扫描结果，触发重新扫描
        setScanResult(null);
        setScanError(null);
        if (sessionId && !propSensitiveColumns) {
          triggerScan();
        }
      }
    };

    // 添加监听器
    sensitiveColumnScanner.addCacheChangeListener(handleCacheChange);

    // 清理函数
    return () => {
      sensitiveColumnScanner.removeCacheChangeListener(handleCacheChange);
    };
  }, [tableName, databaseName, sessionId, autoScan, propSensitiveColumns]);
  // 如果正在扫描，显示扫描状态
  if (isScanning) {
    return (
      <Button
        type="text"
        size={size === 'large' ? 'middle' : (size as any)}
        icon={<SyncOutlined spin />}
        loading={true}
        className={className}
        style={style}
      >
        {formatMessage({
          id: 'odc.component.SensitiveColumnIndicator.Scanning',
          defaultMessage: '正在扫描敏感列...',
        })}
      </Button>
    );
  }

  // 如果有扫描错误，显示错误状态
  if (scanError) {
    const retryText = retryCount > 0 ? `重试(${retryCount})` : '重试';
    const tooltipText =
      retryCount > 2
        ? `${scanError} - 已重试${retryCount}次，请检查网络或稍后再试`
        : `${scanError} - 点击${retryText}`;

    return (
      <Tooltip title={tooltipText}>
        <Tag
          color="error"
          icon={<span style={{ marginRight: 4 }}>⚠️</span>}
          onClick={!isScanning && !isRetrying ? () => triggerScan(true) : undefined}
          className={className}
          style={{ ...style, cursor: !isScanning && !isRetrying ? 'pointer' : 'default' }}
        >
          {isRetrying ? '重试中...' : `扫描失败 - ${retryText}`}
        </Tag>
      </Tooltip>
    );
  }

  // 如果没有敏感列且可以触发扫描，显示扫描按钮
  if (!sensitiveColumns || sensitiveColumns.length === 0) {
    if (tableName && databaseName && sessionId) {
      // 如果是自动扫描且已经扫描过但没有结果，显示"无敏感列"状态
      if (autoScan && scanResult) {
        return (
          <Tag color="success" icon={<SecurityScanOutlined />} className={className} style={style}>
            {formatMessage({
              id: 'odc.component.SensitiveColumnIndicator.NoSensitiveColumns',
              defaultMessage: '无敏感列',
            })}
          </Tag>
        );
      }
      // 手动扫描模式显示扫描按钮
      if (!autoScan) {
        return (
          <Button
            type="text"
            size={size === 'large' ? 'middle' : (size as any)}
            icon={<SecurityScanOutlined />}
            onClick={() => triggerScan()}
            className={className}
            style={style}
          >
            {formatMessage({
              id: 'odc.component.SensitiveColumnIndicator.ScanSensitiveColumns',
              defaultMessage: '扫描敏感列',
            })}
          </Button>
        );
      }
    }
    return null;
  }

  // 按敏感等级分组统计
  const levelCounts = sensitiveColumns.reduce((acc, col) => {
    acc[col.sensitivityLevel] = (acc[col.sensitivityLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 生成提示内容
  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipTitle}>
        <Space>
          {formatMessage({
            id: 'component.SensitiveColumnIndicator.title',
            defaultMessage: '检测到敏感列',
          })}
          {tableName && databaseName && sessionId && (
            <Button
              type="text"
              size="small"
              icon={isScanning ? <SyncOutlined spin /> : <SyncOutlined />}
              loading={isScanning}
              onClick={() => triggerScan(true)}
            >
              {formatMessage({
                id: 'odc.component.SensitiveColumnIndicator.Rescan',
                defaultMessage: '重新扫描',
              })}
            </Button>
          )}
        </Space>
      </div>
      {Object.entries(levelCounts).map(([level, count]) => {
        const config = SENSITIVITY_CONFIG[level];
        return (
          <div key={level} className={styles.tooltipItem}>
            <Space size={4}>
              <span style={{ color: config.color }}>{config.icon}</span>
              <span>
                {config.text}：{count} 列
              </span>
            </Space>
          </div>
        );
      })}
      {showDetails && (
        <div className={styles.tooltipDetails}>
          <div className={styles.tooltipSubtitle}>
            {formatMessage({
              id: 'component.SensitiveColumnIndicator.details',
              defaultMessage: '详细信息：',
            })}
          </div>
          {sensitiveColumns.map((col, index) => {
            const config = SENSITIVITY_CONFIG[col.sensitivityLevel];
            return (
              <div key={index} className={styles.tooltipDetailItem}>
                <Space size={4}>
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <Typography.Text code>{col.columnName}</Typography.Text>
                  <span>({config.text})</span>
                </Space>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const totalCount = sensitiveColumns.length;
  const hasHighSensitive = levelCounts.HIGH > 0;
  const badgeColor = hasHighSensitive ? '#ff4d4f' : '#faad14';

  return (
    <Tooltip
      title={tooltipContent}
      placement="bottomRight"
      overlayInnerStyle={{
        background: '#fff',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e8e8e8',
        padding: '0',
      }}
    >
      <Tag
        color={hasHighSensitive ? 'error' : 'warning'}
        icon={<SecurityScanOutlined />}
        className={className}
        style={style}
      >
        {totalCount}{' '}
        {formatMessage({
          id: 'component.SensitiveColumnIndicator.label',
          defaultMessage: '敏感列',
        })}
      </Tag>
    </Tooltip>
  );
};

export default SensitiveColumnIndicator;
export type { ISensitiveColumnInfo, ISensitiveColumnIndicatorProps };
