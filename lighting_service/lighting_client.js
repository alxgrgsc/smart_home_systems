const grpc = require('@grpc/grpc-js');
const chalk = require('chalk');
const protoLoader = require('@grpc/proto-loader');
const inquirer = require('inquirer');

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('smart_lighting.proto', {});
const smartLighting = grpc.loadPackageDefinition(packageDefinition).smart_home;

//create gRPC client
const client = new smartLighting.Lighting('localhost:50051', grpc.credentials.createInsecure());

async function main() {
  let continueQuery = true;

  do {
    console.log();

    const { choice } = await inquirer.prompt({
      type: 'list',
      name: 'choice',
      message: chalk.yellow('Select an operation:'),
      choices: [
        'Light Status',
        'Brightness Status',
        'Colour Status',
        'Turn On/Off',
        'Adjust Brightness',
        'Change Colour',
        new inquirer.Separator(),
      ],
    });

    switch (choice) {
      case 'Light Status':
        await new Promise((resolve, reject) => {
          client.LightStatus({}, (error, response) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log('Light status:', chalk.yellow(response.message));
              resolve();
            }
          });
        });
        break;
      case 'Brightness Status':
        await new Promise((resolve, reject) => {
          client.BrightnessStatus({}, (error, response) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log('Brightness level:', response.brightnessLevel,'%');
              resolve();
            }
          });
        });
        break;
      case 'Colour Status':
        await new Promise((resolve, reject) => {
          client.ColourStatus({}, (error, response) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log('Current colour:', chalk.yellow(response.colour));
              resolve();
            }
          });
        });
        break;
      case 'Turn On/Off':
        const { isOnInput } = await inquirer.prompt({
          type: 'list',
          name: 'isOnInput',
          message: 'Turn light on or off:',
          choices: ['On', 'Off'],
        });
        const isOn = isOnInput === 'On';

        // Check current light status before changing
        let currentStatus;
        await new Promise((resolve, reject) => {
          client.LightStatus({}, (error, response) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              currentStatus = response.isOn;
              resolve();
            }
          });
        });

        if ((isOn && currentStatus === 'On') || (!isOn && currentStatus === 'Off')) {
          console.log(chalk.yellow(`The light is already ${currentStatus}.`));
        } else {
          await new Promise((resolve, reject) => {
            client.ChangeLightStatus({ isOn }, (error, response) => {
              if (error) {
                console.error(error);
                reject(error);
              } else {
                console.log(chalk.yellow(response.message));
                resolve();
              }
            });
          });
        }
        break;
        case 'Adjust Brightness':
          const { newBrightnessLevel } = await inquirer.prompt({
            type: 'input',
            name: 'newBrightnessLevel',
            message: 'Enter new brightness level(0-100):',
            validate: function(value) {
              var valid = !isNaN(parseFloat(value)) && isFinite(value) && value >= 0 && value <= 100;
              return valid || 'Please enter a number between 0 and 100';
            },
          });
        
          await new Promise((resolve, reject) => {
            client.AdjustBrightness({ newBrightnessLevel: parseInt(newBrightnessLevel, 10) }, (error, response) => {
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
      case 'Change Colour':
        const { newColour } = await inquirer.prompt({
          type: 'list',
          name: 'newColour',
          message: 'Enter new colour:',
          choices: ['white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink'],
        });

        await new Promise((resolve, reject) => {
          client.ChangeColour({ colour: newColour }, (error, response) => {
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
      type: 'input',
      name: 'anotherQuery',
      message: 'Do you want to select another query? (y/n)',
      validate: function(value) {
        var valid = value.toLowerCase() === 'y' || value.toLowerCase() === 'n';
        return valid || 'Please enter y for Yes or n for No';
      },
    });
    
    continueQuery = anotherQuery.toLowerCase() === 'y';

    continueQuery = anotherQuery;
  } while (continueQuery);
}

main();