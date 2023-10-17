/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { formatMessage } from '@/util/intl';

function unifiedStr(value: string) {
  return value?.replace(/\\"|\\t|\'/g, '');
}
export function getOBUser(value) {
  const [username, tenantName = null, clusterName = null] = value?.split(/\@|#|:/);
  return {
    username,
    tenantName,
    clusterName,
  };
}
class Parser {
  constructor(options) {
    this.options = options;
  }
  options: {
    name: string;
    param: [string, string];
    type: Function;
  }[] = [];
  handlers = {};
  validateOptions = () => {
    const { options } = this;
    const error = [];
    if (!options?.length) {
      error?.push(
        formatMessage({
          id: 'odc.src.util.TheOptionCannotBeEmpty',
        }), //'选项不能为空'
      );
    }
    for (const option of options) {
      const { name, param, type } = option;
      const [shortp] = param;
      if (param?.some((item) => !item?.startsWith('-'))) {
        error?.push(
          formatMessage(
            {
              id: 'odc.src.util.TheOptionNameMustStart',
            },
            {
              name: name,
            },
          ), //`选项名称必须要以 - 开头: ${name}`
        );
      }
      if (param?.some((item) => item?.length === 1)) {
        error?.push(
          formatMessage(
            {
              id: 'odc.src.util.TheOptionKeyMustContain',
            },
            {
              name: name,
            },
          ), //`选项键必须包含一个名称，不允许使用单独的 -: ${name}`
        );
      }
      if (typeof type !== 'function') {
        error?.push(
          formatMessage(
            {
              id: 'odc.src.util.TheOptionTypeIsLacking',
            },
            {
              name: name,
            },
          ), //`选项类型缺少或不是函数: ${name}`
        );
      }
      if (shortp[1] !== '-' && shortp.length > 2) {
        error?.push(
          formatMessage(
            {
              id: 'odc.src.util.TheShortOptionNameMust',
            },
            {
              name: name,
            },
          ), //`短选项名称必须只有一个字符: ${name}`
        );
      }
    }
    return error;
  };
  parse(command) {
    const { handlers, options } = this;
    const args = unifiedStr(command)?.split(/\s+/)?.slice(1);
    const result: {
      [key: string]: any;
    } = {
      _: [],
    };
    const errors = this.validateOptions();
    if (errors?.length) {
      return;
    }
    for (const option of options) {
      const { name, param, type } = option;
      let isFlag = type === Boolean;
      param.forEach((key) => {
        handlers[key] = [name, type, isFlag];
      });
    }
    for (let i = 0, len = args.length; i < len; i++) {
      const wholeArg = args[i];
      if (wholeArg === '--') {
        result._ = result._.concat(args.slice(i + 1));
        break;
      }
      if (wholeArg.length > 1 && wholeArg[0] === '-') {
        const [argName, argStr] =
          wholeArg[1] === '-' ? wholeArg.split(/=(.*)/, 2) : [wholeArg.substr(0, 2), undefined];
        const [name, type, isFlag] = handlers[argName] ?? [];
        if (!(argName in handlers)) {
          continue;
        }
        if (isFlag) {
          result[name] = type(true, name, result[name]);
        } else if (argStr === undefined) {
          if (wholeArg[1] !== '-' && wholeArg.length > 2) {
            let value: any = wholeArg?.substr(2);
            result[name] = type(value, name, result[name]);
          } else {
            const next = args[i + 1];
            const isNextValid = !next?.startsWith('-');
            let value: any = isNextValid ? next : null;
            result[name] = type(value, name, result[name]);
            if (isNextValid) {
              ++i;
            }
          }
        } else {
          result[name] = type(argStr, name, result[name]);
        }
      } else {
        result._.push(wholeArg);
      }
    }
    return result;
  }
}
export const parser = new Parser([
  {
    name: 'user',
    param: ['-u', '--user'],
    type: String,
  },
  {
    name: 'host',
    param: ['-h', '--host'],
    type: String,
  },
  {
    name: 'port',
    param: ['-P', '--port'],
    type: Number,
  },
  {
    name: 'password',
    param: ['-p', '--password'],
    type: String,
  },
  {
    name: 'database',
    param: ['-D', '--database'],
    type: String,
  },
  {
    name: 'no-auto-rehash',
    param: ['-A'],
    type: String,
  },
  {
    name: 'batch',
    param: ['-B'],
    type: String,
  },
  {
    name: 'comments',
    param: ['-c'],
    type: String,
  },
  {
    name: 'compress',
    param: ['-C'],
    type: String,
  },
  {
    name: 'vertical',
    param: ['-E'],
    type: String,
  },
  {
    name: 'force',
    param: ['-f'],
    type: String,
  },
  {
    name: 'ignore-spaces',
    param: ['-i'],
    type: String,
  },
  {
    name: 'no-beep',
    param: ['-b'],
    type: String,
  },
  {
    name: 'skip-line-numbers',
    param: ['-L'],
    type: String,
  },
  {
    name: 'unbuffered',
    param: ['-n'],
    type: String,
  },
  {
    name: 'wait',
    param: ['-w'],
    type: String,
  },
  {
    name: 'verbose',
    param: ['-v'],
    type: String,
  },
  {
    name: 'skip-column-names',
    param: ['-N'],
    type: String,
  },
]);
