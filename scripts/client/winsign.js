exports.default = async function(configuration) {
    // do not include passwords or other sensitive data in the file
    // rather create environment variables with sensitive data
    const CONFIG_FILE = process.env.WINDOWS_SIGN_CONFIG_FILE;
  
    require("child_process").execSync(
      // your commande here ! For exemple and with JSign :
      ` smctl sign --keypair-alias key_1318155498 --config-file ${CONFIG_FILE}  --input "${configuration.path}" -v`,
      {
        stdio: "inherit"
      }
    );
  };