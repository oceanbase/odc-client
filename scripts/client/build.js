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

const { execSync } = require('child_process');
const path = require('path');
const electronBuilder = require('electron-builder');
/**
 * build renderer
 */
async function buildWeb() {
  const result = execSync('npm run build:client', {
    stdio: 'inherit',
  });
  if (result && result.error) {
    console.error(result.error.message);
    return false;
  }
  return true;
}

async function buildClient(target) {
  const buildMap = {
    mac: [
      {
        ENV: '',
        ARCH: '',
        targets: electronBuilder.Platform.MAC.createTarget(),
      },
    ],
    'mac-jre': [
      {
        ENV: 'jre',
        ARCH: '',
        targets: electronBuilder.Platform.MAC.createTarget(),
      },
    ],
    'linux_x86': [
      {
        ENV: 'jre',
        ARCH: '',
        targets: electronBuilder.Platform.LINUX.createTarget(['deb', 'AppImage'], electronBuilder.Arch.x64),
      },
    ],
    'linux_aarch64': [
      {
        ENV: 'jre',
        ARCH: '',
        targets: electronBuilder.Platform.LINUX.createTarget(['deb', 'AppImage'], electronBuilder.Arch.arm64),
      },
    ],
    win: [
      {
        ENV: '',
        ARCH: 'win64',
        targets: electronBuilder.Platform.WINDOWS.createTarget('nsis', electronBuilder.Arch.x64),
      },
      {
        ENV: '',
        ARCH: 'win32',
        targets: electronBuilder.Platform.WINDOWS.createTarget('nsis', electronBuilder.Arch.ia32),
      },
    ],
    'win-jre': [
      {
        ENV: 'jre',
        ARCH: 'win64',
        targets: electronBuilder.Platform.WINDOWS.createTarget('nsis', electronBuilder.Arch.x64),
      },
    ]
  };
  const command = buildMap[target];
  if (!command) {
    return false;
  }
  for (const c of command) {
    process.env.ENV = c.ENV;
    process.env.ARCH = c.ARCH;
    try {
      await electronBuilder.build({
        targets: c.targets,
      });
    } catch (e) {
      console.error('构建失败！', e)
      process.exit(1)
    }
  }
  return true;
}

async function run() {
  console.log('sign: ', process.env.CSC_LINK)
  switch (process.argv[2]) {
    case 'mac': {
      execSync('npm run prepack jre jar obclient', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'mac',
        },
      });
      await buildWeb();
      await buildClient('mac-jre');
      return;
    }
    case 'linux_x86': {
      execSync('npm run prepack jre jar obclient', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'linux_x86',
        },
      });
      await buildWeb();
      await buildClient('linux_x86');
      return;
    }
    case 'linux_aarch64': {
      execSync('npm run prepack jre jar obclient', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'linux_aarch64',
        },
      });
      await buildWeb();
      await buildClient('linux_aarch64');
      return;
    }
    case 'win': {
      execSync('npm run prepack jar obclient', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'win64',
        }
      });
      await buildWeb();
      await buildClient('win');
      execSync('npm run prepack jre', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'win64',
        },
      });
      await buildClient('win-jre');
      return;
    }
    case 'all': {
      /**
      * mac (jre)
      */
      execSync('npm run prepack jre jar', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'mac',
        },
      });
      await buildWeb();
      await buildClient('mac-jre');

      /**
       * win 64 (jre)
       */
      execSync('npm run prepack jre obclient', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'win64',
        },
      });
      await buildClient('win-jre');

      /**
       * linux x64
       */
      execSync('npm run prepack jre obclient', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'linux_x86',
        },
      });
      await buildClient('linux_x86');

      /**
       * linux arm64
       */
      execSync('npm run prepack jre obclient', {
        stdio: 'inherit',
        env: {
          ...process.env,
          platform: 'linux_aarch64',
        },
      });
      await buildClient('linux_aarch64');
      return;
    }
    case 'test': {
      await buildClient('mac');
      return;
    }
  }
  console.log('[Done]Electron Builder')
}
run();
