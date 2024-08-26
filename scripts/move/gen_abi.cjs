require("dotenv").config();
const fs = require('node:fs');
const path = require('path');
const yaml = require("js-yaml");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const restUrl = config["profiles"][`${process.env.PROJECT_NAME}-${process.env.VITE_APP_NETWORK}`]["rest_url"];

async function main() {
  if (!process.env.VITE_PACKAGE_ADDRESS) {
    throw new Error(
      "VITE_PACKAGE_ADDRESS variable is not set, make sure you have published the module before upgrading it",
    );
  }
  const packageAddress = process.env.VITE_PACKAGE_ADDRESS;

  // List all modules that need to be generated
  const moduleFilePaths = [
    './move/sources/friend_pool.move',
    './move/sources/coinflip.move',
    './move/sources/limbo.move',
    './move/sources/dice.move',
  ]

  moduleFilePaths.forEach(async (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Extract package name using regular expression or other parsing logic
    const moduleNameMatch = fileContent.match(/module [^:]*::(.*) \{/);
    const moduleName = moduleNameMatch ? moduleNameMatch[1] : '';
    console.log('Module name:', moduleName);
  
    const abiResponse = await fetch(`${restUrl}/v1/accounts/${packageAddress}/module/${moduleName}`).then(res => res.json());
    const abiData = abiResponse.abi;
  
    const tsContent = `export const ABI = ${JSON.stringify(abiData)} as const`;
    const tsFilePath = path.join('./dapp/aptos', `${moduleName}-abi.ts`);
    fs.writeFileSync(tsFilePath, tsContent);
  
    console.log('ABI data written to', tsFilePath);
  })
}

main();
