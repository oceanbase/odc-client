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

const css =require('css');
const fs = require('fs');
const path = require('path');

const file = path.resolve(process.cwd(), 'src/style/theme/antd.darkTemplate.css');
console.log(file)
const colorCovertMap = {
    "#1f1f1f": "var(--background-secondry-color)",
    "#141414": "var(--background-primary-color)",
    "#1d1d1d": "var(--table-header-background-color)"
}

async function run () {
    const result = css.parse(fs.readFileSync(file).toString())
    if (result?.stylesheet?.rules) {
        result.stylesheet.rules = result?.stylesheet?.rules?.filter(rule => {
            if (rule.type === 'comment' || rule.type === 'keyframes') {
                return false;
            }
            /**
             * 存在border的颜色，这里就需要保留所有的border属性，防止width的值缺失
             */
            const hasBorderColor = rule.declarations?.find(d => {
                const value = d.value;
                const property = d.property;
                return /border/.test(property) && /#|rgba|rgb|transparent/.test(value)
            });
            
            rule.declarations = rule.declarations?.filter(d => {
                const value = d.value;
                const property = d.property;
                if (colorCovertMap[value]) {
                    d.value = colorCovertMap[value];
                }
                if (/#|rgba|rgb|transparent/.test(value) || (hasBorderColor && /border/.test(property)) || /opacity/.test(property)) {
                    return true;
                }
                else {
                    return false;
                }
            })
            if (rule.declarations?.length === 0) {
                return false;
            }
            return true;
        })
    }
    fs.writeFileSync(path.resolve(process.cwd(), 'src/style/theme/antd.dark.less'), '/*自动生成的文件，不要改动！*/\n.odc-dark{\n' + css.stringify(result)?.split('\n').map(a => '  ' + a).join('\n') + '\n}')

}
run ();