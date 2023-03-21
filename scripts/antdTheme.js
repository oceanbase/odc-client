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