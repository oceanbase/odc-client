import 'reflect-metadata';
const supportedCommands = ['copy'];
global.document.queryCommandSupported = (cmd) => supportedCommands.includes(cmd);
global.ENV_target = 'web';
global.ENV_environment = 'private';
global.RELEASE_DATE = Date.now();
