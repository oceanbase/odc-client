import request from '@/util/request';

export async function getObClientUploadList() {
  const res = await request.get(`/api/v1/obclient/files/list`);
  return res?.data?.sort?.((a, b) => b.createTimestamp - a.createTimestamp);
}

export async function deleteUploadFile(fileName: string) {
  const res = await request.delete(`/api/v1/obclient/files/${fileName}`);
  return !!res?.data;
}
