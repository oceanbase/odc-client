import { formatMessage } from '@/util/intl';
import { Space, Button } from 'antd';

const DrawerFooter: React.FC<{
  hasEdit: boolean;
  confirmLoading: boolean;
  handleSubmit: () => void;
  handleCancel: (hasEdit: boolean) => void;
}> = ({ hasEdit, confirmLoading, handleSubmit, handleCancel }) => {
  return (
    <Space>
      <Button
        onClick={() => {
          handleCancel(hasEdit);
        }}
      >
        {
          formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.Cancel',
          })

          /* 取消 */
        }
      </Button>
      <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
        {
          formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.New',
          })

          /* 新建 */
        }
      </Button>
    </Space>
  );
};
export default DrawerFooter;
