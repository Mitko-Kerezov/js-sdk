const path = require('path');
const program = require('commander');
const createPlatformSpecificConfig = require('./create-platform-specific-config.js');
const cleanUpUserCollection = require('./clean-up-user-collection.js');

program
  .option('--platform [type]', 'Add Platform [html5/phonegap/nativescript]')
  .option('--os [type]', 'Add OS [android/ios]')
  .option('--device [type]', 'Specify DeviceId')
  .parse(process.argv);

const runnerConfigFilePath = path.join(__dirname, '../../', 'packages', `kinvey-${program.platform}-sdk`, 'runner-config');

const config = createPlatformSpecificConfig(program.platform, program.os);

cleanUpUserCollection(config)
  .then(() => {
    const runPipeline = require(runnerConfigFilePath);
    return runPipeline(program.os, program.device)
  })
  .then(() => {
    console.log('The tests passed successfully!');
    if (program.platform === 'html5') {
      process.exit(0);
    }
  })
  .catch(err => {
    const error = err || '';
    console.log(`The pipeline finished with an error!!! ${error}`);
    process.exit(1);
  });
