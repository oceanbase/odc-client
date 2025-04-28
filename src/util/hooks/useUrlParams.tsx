import { useLocation, useNavigate } from '@umijs/max';

const useURLParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);

  const getParam = (paramKey) => {
    return searchParams.get(paramKey);
  };

  const deleteParam = (paramKey) => {
    searchParams.delete(paramKey);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  return { searchParams, getParam, deleteParam };
};

export default useURLParams;
