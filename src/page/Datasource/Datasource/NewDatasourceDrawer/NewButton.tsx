import { formatMessage } from '@/util/intl';
import { Button } from 'antd';
import { useState } from 'react';
import NewDatasourceDrawer from '.';

export default function NewDatasourceButton(props: { onSuccess: () => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        {
          formatMessage({
            id: 'odc.Datasource.NewDatasourceDrawer.NewButton.CreateADataSource',
          }) /*新建数据源*/
        }
      </Button>
      <NewDatasourceDrawer
        visible={visible}
        close={() => setVisible(false)}
        onSuccess={props.onSuccess}
      />
    </>
  );
}
