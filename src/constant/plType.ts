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

export default {
  PKG_HEAD: 'PACKAGE_HEAD',
  PKG_BODY: 'PACKAGE_BODY',
  FUNCTION: 'FUNCTION',
  PROCEDURE: 'PROCEDURE',
  TRIGGER: 'TRIGGER',
  SYNONYM: 'SYNONYM',
  TYPE: 'TYPE',
};

export enum PLType {
  PKG_HEAD = 'PACKAGE_HEAD',
  PKG_BODY = 'PACKAGE_BODY',
  PACKAGE_ROOT = 'PACKAGE_ROOT',
  FUNCTION = 'FUNCTION',
  PROCEDURE = 'PROCEDURE',
  TRIGGER = 'TRIGGER',
  SYNONYM = 'SYNONYM',
  TYPE = 'TYPE',
  ANONYMOUSBLOCK = 'ANONYMOUS_BLOCK',
}
