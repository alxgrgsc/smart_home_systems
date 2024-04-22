const grpc = require('@grpc/grpc-js');
const chalk = require('chalk');
const protoLoader = require('@grpc/proto-loader');
const inquirer = require('inquirer');

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('./thermostat_service/smart_thermostat.proto', {});
const smartThermostat = grpc.loadPackageDefinition(packageDefinition).smart_home;

//create a new client instance

function main() {
  return async function () {
    try {
      const client = new smartThermostat.Thermostat('localhost:50053', grpc.credentials.createInsecure());

      let continueQuery = true;

      do {
        console.log();

        const { choice } = await inquirer.prompt({
          type: 'list',
          name: 'choice',
          message: chalk.yellow('Hive Thermostat (\u00B0C):'),
          choices: [
            'Temperature Status',
            'Set Temperature',
            'Boost Status',
            'Manage Boost',
            'Hot Water Status',
            'Set Hot Water',
            new inquirer.Separator(),
          ],
        });

        switch (choice) {
          case 'Temperature Status':
            await new Promise((resolve, reject) => {
              client.TemperatureStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log('Temperature Status:', chalk.yellow(response.currentTemperature + '\u00B0C'));
                  resolve();
                }
              });
            });
            break;
          case 'Set Temperature':
            const { setTemperature } = await inquirer.prompt({
              type: 'input',
              name: 'setTemperature',
              message: 'Enter new temperature(\u00B0C):',
              validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                if (!valid) {
                  return 'Please enter a valid number';
                }
                var temp = parseFloat(value);
                if (temp < 5 || temp > 35) {
                  return 'Please enter a temperature between 5\u00B0C and 35\u00B0C';
                }
                return true;
              },
            });

            await new Promise((resolve, reject) => {
              client.SetTemperature({ setTemperature: parseFloat(setTemperature) }, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log(chalk.yellow(response.message));
                  resolve();
                }
              });
            });
            break;
          case 'Boost Status':
            await new Promise((resolve, reject) => {
              client.BoostStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  let boostStatusMessage = 'Boost Status: ';
                  if (response.isBoostActive) {
                    boostStatusMessage += ` ${response.boostTemperature}\u00B0C / ${response.boostTimeRemaining} minutes`;
                  } else {
                    boostStatusMessage += 'Off';
                  }
                  console.log(chalk.yellow(boostStatusMessage));
                  resolve();
                }
              });
            });
            break;
          case 'Manage Boost':
            const { manageBoostChoice } = await inquirer.prompt({
              type: 'list',
              name: 'manageBoostChoice',
              message: 'Select an operation:',
              choices: ['Set Boost On/Off', 'Adjust Boost'],
            });

            switch (manageBoostChoice) {
              case 'Set Boost On/Off':
                const { setBoost } = await inquirer.prompt({
                  type: 'list',
                  name: 'setBoost',
                  message: 'Turn boost on or off:',
                  choices: ['On', 'Off'],
                });

                await new Promise((resolve, reject) => {
                  client.SetBoost({ setBoost: setBoost === 'On' }, (error, response) => {
                    if (error) {
                      console.error(error);
                      reject(error);
                    } else {
                      console.log(chalk.yellow(response.message));
                      resolve();
                    }
                  });
                });
                break;
              case 'Adjust Boost':
                const { boostTemperature, boostTime } = await inquirer.prompt([{
                  type: 'input',
                  name: 'boostTemperature',
                  message: 'Enter boost temperature(\u00B0C):',
                  validate: function (value) {
                    var valid = !isNaN(parseFloat(value));
                    if (!valid) {
                      return 'Please enter a valid number';
                    }
                    var temp = parseFloat(value);
                    if (temp < 5 || temp > 35) {
                      return 'Please enter a temperature between 5\u00B0C and 35\u00B0C';
                    }
                    return true;
                  },
                }, {
                  type: 'input',
                  name: 'boostTime',
                  message: 'Enter boost time(minutes):',
                  validate: function (value) {
                    var valid = !isNaN(parseFloat(value));
                    if (!valid) {
                      return 'Please enter a valid time in minutes between 15 and 240';
                    }
                    var time = parseFloat(value);
                    if (time < 15 || time > 240) {
                      return 'Please enter a time between 15 minutes and 240 minutes';
                    }
                    return true;
                  },
                }]);

                await new Promise((resolve, reject) => {
                  client.ManageBoost({ boostTemperature: parseFloat(boostTemperature), boostTime: parseFloat(boostTime) }, (error, response) => {
                    if (error) {
                      console.error(error);
                      reject(error);
                    } else {
                      console.log(chalk.yellow(response.message));
                      resolve();
                    }
                  });
                });
                break;
            }
            break;
          case 'Hot Water Status':
            await new Promise((resolve, reject) => {
              client.HotWaterStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log('Hot Water Status:', chalk.yellow(response.message));
                  resolve();
                }
              });
            });
            break;
          case 'Set Hot Water':
            const { setHotWater } = await inquirer.prompt({
              type: 'list',
              name: 'setHotWater',
              message: 'Turn hot water on or off:',
              choices: ['On', 'Off'],
            });

            await new Promise((resolve, reject) => {
              client.SetHotWater({ setHotWater: setHotWater === 'On' }, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log(chalk.yellow(response.message));
                  resolve();
                }
              });
            });
            break;
          default:
            console.log(chalk.red('Invalid choice. Please select an option from the list.'));
            break;
        }

        const { anotherQuery } = await inquirer.prompt({
          type: 'list',
          name: 'anotherQuery',
          message: 'Do you want to select another query?',
          choices: ['Yes', 'No']
        });

        continueQuery = anotherQuery === 'Yes';

      } while (continueQuery);
    } catch (error) {
      if (error.code === grpc.status.UNAVAILABLE) {
        console.error(chalk.red('Error: Server is unavailable. Please try again later.'));
      } else {
        console.error(chalk.red('Error:', error.message));
      }
    }
  }
}


module.exports.main = main;