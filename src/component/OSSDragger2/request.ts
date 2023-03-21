import type { IProgressEvent, IRequestError, IRequestOption } from './interface';

function getError(option: IRequestOption, xhr: XMLHttpRequest) {
  const msg = `error: ${option.method} ${option.action} ${xhr.status}'`;
  const err = new Error(msg) as IRequestError;
  err.status = xhr.status;
  err.method = option.method;
  err.url = option.action;
  return err;
}

function getBody(xhr: XMLHttpRequest) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export function request(option: IRequestOption) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const headers = option.headers || {};

    if (option.data) {
      Object.keys(option.data).forEach((key) => {
        const value = option.data[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return;
        }
        formData.append(key, value as string | Blob);
      });
    }

    if (option.file instanceof Blob) {
      formData.append(option.filename, option.file, (option.file as any).name);
    } else {
      // @ts-ignore
      formData.append(option.filename, option.file);
    }

    if (option.onProgress && xhr.upload) {
      xhr.upload.onprogress = function progress(e: IProgressEvent) {
        if (e.total > 0) {
          e.percent = (e.loaded / e.total) * 100;
        }
        option.onProgress(e);
      };
    }
    xhr.onerror = function error(e) {
      reject(e);
      option.onError(e);
    };

    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(getError(option, xhr));
        return option.onError(getError(option, xhr), getBody(xhr));
      }
      resolve(getBody(xhr));
      return option.onSuccess(getBody(xhr), xhr);
    };

    xhr.open(option.method, option.action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }
    if (headers['X-Requested-With'] !== null) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }

    Object.keys(headers).forEach((h) => {
      if (headers[h] !== null) {
        xhr.setRequestHeader(h, headers[h]);
      }
    });

    xhr.send(formData);
  });
}
