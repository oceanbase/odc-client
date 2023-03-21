const checker = require('./checker');
const pullJar = require('./pullJar');
const pullJre = require('./pullJre');
const pullOBClient = require('./pullOBClient');

const params = process.argv.slice(2);
const commands = {
  jar: pullJar.run,
  jre: pullJre.run,
  obclient: pullOBClient.run
};

async function run() {
  for (let i = 0; i < params.length; i++) {
    const command = commands[params[i]];
    if (command) {
      await command();
    }
  }
  checker();
}

run();
