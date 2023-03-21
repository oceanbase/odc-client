import type { UploadFile } from 'antd/lib/upload/interface';
export interface IProgressEvent extends Partial<ProgressEvent> {
  percent?: number;
  isLimit?: boolean;
}

export interface IRequestError extends Error {
  status?: number;
  method?: string;
  url?: string;
}

export interface IRequestOption<T = any> {
  onProgress?: (event: IProgressEvent) => void;
  onError?: (event: IRequestError | ProgressEvent, body?: T) => void;
  onSuccess?: (body: T, xhr?: XMLHttpRequest) => void;
  data?: Record<string, unknown>;
  filename?: string;
  file: UploadFile;
  withCredentials?: boolean;
  action: string;
  headers?: Record<string, string>;
  method: string;
}
