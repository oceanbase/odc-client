const fs = require('fs');
const path = require('path');

const pluginPath = process.env.ODC_PLUGIN_PATH;
const pluginInfoFilePath = path.resolve(process.cwd(), 'src/plugins/pluginList.ts')
fs.writeFileSync(
    pluginInfoFilePath,
    `export default [];`
)
fs.writeFileSync(path.join(process.cwd(), '.env'), '');
if (!pluginPath) {
    return;
}

const configPath = path.join(pluginPath, 'config.json');

if (!fs.existsSync(configPath)) {
    console.log('Config Not Found');
    process.exit(1);
}


const odcPluginPath = path.join(process.cwd(), 'src/plugins/udp');



const config = JSON.parse(fs.readFileSync(configPath)?.toString());



function resolvePlugins() {
    let pluginImport = [];
    let exportVariables = [];
    if (!fs.existsSync(odcPluginPath)) {
        fs.mkdirSync(odcPluginPath)
    }
    /**
     * 扫描插件路径
     */
    for (let i = 0; i < config.plugins?.length; i++) {
        const { path: plugin, name } = config.plugins[0];
        const absolutePath = path.resolve(process.cwd(), pluginPath, plugin);
        const linkPath = path.join(odcPluginPath, name);
        if (fs.existsSync(linkPath)) {
            fs.unlinkSync(linkPath)
        }
        /**
         * 建立映射
         */
        fs.symlinkSync(absolutePath, linkPath);
        pluginImport.push(`import * as ${name} from "./udp/${name}"`)
        exportVariables.push(name);
    }

    fs.writeFileSync(
        pluginInfoFilePath,
        pluginImport?.join('\n') + '\n' +
        `export default [${exportVariables?.join('\n')}]`
    )
}


function resolveEnv() {
    const env = config.env;
    if (!env) {
        return;
    }
    let envContent = "";
    env.forEach(e => {
        console.log('set env', e)
        envContent += `${e[0]}=${e[1]}\n`;
    })
    if (config.umiConfig) {
        envContent+= `UMI_ENV=odcPlugin`
        const linkPath = path.resolve(process.cwd(), 'config/config.odcPlugin.js');
        if (fs.existsSync(linkPath)) {
            fs.unlinkSync(linkPath);
        }
        fs.symlinkSync(path.resolve(pluginPath, config.umiConfig), linkPath)
    }
    fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
}



resolvePlugins();

resolveEnv();

