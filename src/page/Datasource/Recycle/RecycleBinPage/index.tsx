import RecycleBinPage from '@/page/Workspace/components/RecycleBinPage';

interface IProps {
  dataSourceId: string;
}

export default function RecycleBin({ dataSourceId }: IProps) {
  return <RecycleBinPage datasourceId={parseInt(dataSourceId)} />;
}
