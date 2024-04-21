const grpc = require('@grpc/grpc-js');
const chalk = require('chalk');
const protoLoader = require('@grpc/proto-loader');
const inquirer = require('inquirer');

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('smart_thermostat.proto', {});
const smartThermostat = grpc.loadPackageDefinition(packageDefinition).smart_home;

//create a new client instance
const client = new smartThermostat.Thermostat('localhost:50053', grpc.credentials.createInsecure());

async function main() {
  let continueQuery = true;

  do {
    console.log();

    const { choice } = await inquirer.prompt({
      type: 'list',
      name: 'choice',
      message: chalk.yellow('Select an operation:'),
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
              console.log('Temperature Status:', chalk.yellow(response.currentTemperature));
              resolve();
            }
          });
        });
        break;
      case 'Set Temperature':
        const { setTemperature } = await inquirer.prompt({
          type: 'input',
          name: 'setTemperature',
          message: 'Enter new temperature:',
          validate: function (value) {
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
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
                boostStatusMessage += `On ${response.boostTemperature} degrees ${response.boostTimeRemaining} minutes`;
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
              message: 'Enter boost temperature:',
              validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a valid number';
              },
            }, {
              type: 'input',
              name: 'boostTime',
              message: 'Enter boost time:',
              validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a valid number';
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
      type: 'confirm',
      name: 'anotherQuery',
      message: 'Do you want to select another query?',
    });

    continueQuery = anotherQuery;
  } while (continueQuery);
}

main();