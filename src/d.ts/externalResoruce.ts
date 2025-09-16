export interface ICreateExternalResourceParams {
  formData: FormData;
  sessionId: string;
  databaseName: string;
  resourceName: string;
}

export interface IExternalResource {
  id?: number | string; // API可能不返回id，使用name作为fallback
  name: string;
  type: string;
  url?: string; // API可能不返回url
  description?: string;
  createTime?: number;
  modifyTime?: number;
  schemaName?: string; // API返回的字段
}
