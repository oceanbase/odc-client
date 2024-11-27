import Icon, { LoadingOutlined } from '@ant-design/icons';
import { useState } from 'react';

const IconLoadingWrapper = ({ icon }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div onClick={handleClick}>
      {loading ? <Icon component={LoadingOutlined} /> : <Icon component={icon} />}
    </div>
  );
};

export default IconLoadingWrapper;
