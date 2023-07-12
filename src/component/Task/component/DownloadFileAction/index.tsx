import { getTaskFile } from '@/common/network/task';
import Action from '@/component/Action';
import { downloadFile } from '@/util/utils';

interface IProps {
  taskId: number;
  objectId: string;
}

export const DownloadFileAction: React.FC<IProps> = (props) => {
  const { taskId, objectId } = props;

  const handleDownloadFile = async () => {
    const fileUrl = await getTaskFile(taskId, [objectId]);
    fileUrl?.forEach((url) => {
      url && downloadFile(url);
    });
  };

  return objectId ? <Action.Link onClick={handleDownloadFile}>下载备份回滚方案</Action.Link> : null;
};