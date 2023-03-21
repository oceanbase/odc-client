import PageLoading from '../PageLoading';

export default function () {
  // return <div className={styles.loading}>
  //   <Spin tip='Loading...' />
  // </div>;
  return <PageLoading showError={false} />;
}
