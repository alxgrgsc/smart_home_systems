// Purpose: Client for the smart lighting service. It allows the user to interact with the lighting service by querying the current status of the light, turning the light on or off, adjusting the brightness level, and changing the colour of the light.


//import modules
const grpc = require('@grpc/grpc-js');
const chalk = require('chalk');
const protoLoader = require('@grpc/proto-loader');
const inquirer = require('inquirer');

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('./lighting_service/smart_lighting.proto', {});
const smartLighting = grpc.loadPackageDefinition(packageDefinition).smart_home;

function main() {
  return async function () {
    try {
      //create a new gRPC client instance
      const client = new smartLighting.Lighting('localhost:50051', grpc.credentials.createInsecure());
      let continueQuery = true;

      do {
        //blank line for spacing
        console.log();
        //prompt user to select an option
        const { choice } = await inquirer.prompt({
          type: 'list',
          name: 'choice',
          message: chalk.yellow('Hue Lighting:'),
          choices: [
            'Light Status',
            'Turn Light On/Off',
            'Brightness Status',
            'Adjust Brightness',
            'Colour Status',
            'Change Colour',
            new inquirer.Separator(),
          ],
        });

        //handle user's choice
        switch (choice) {
          case 'Light Status':
            //get light status
            await new Promise((resolve, reject) => {
              client.LightStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log('Light status:', chalk.yellow(response.message));
                  console.log();
                  resolve();
                }
              });
            });
            break;
          case 'Brightness Status':
            //get brightness status
            await new Promise((resolve, reject) => {
              client.BrightnessStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log('Brightness level:', response.brightnessLevel, '%');
                  console.log();
                  resolve();
                }
              });
            });
            break;
          case 'Colour Status':
            //get colour status
            await new Promise((resolve, reject) => {
              client.ColourStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log('Current colour:', chalk.yellow(response.colour));
                  console.log();
                  resolve();
                }
              });
            });
            break;
          case 'Turn Light On/Off':
            //turn light on or off
            const { isOnInput } = await inquirer.prompt({
              type: 'list',
              name: 'isOnInput',
              message: 'Turn light on or off:',
              choices: ['On', 'Off'],
            });
            const isOn = isOnInput === 'On';

            // check current light status before changing
            let currentStatus;
            await new Promise((resolve, reject) => {
              client.LightStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  currentStatus = response.isOn;
                  console.log();
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
            //adjust brightness
            const { newBrightnessLevel } = await inquirer.prompt({
              type: 'input',
              name: 'newBrightnessLevel',
              message: 'Enter new brightness level(0-100):',
              validate: function (value) {
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
            //change colour
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
                  console.log();
                  resolve();
                }
              });
            });
            break;
          default:
            console.log(chalk.red('Invalid choice. Please select an option from the list.'));
            break;
        }
        //prompt user if they want to select another query
        const { anotherQuery } = await inquirer.prompt({
          type: 'list',
          name: 'anotherQuery',
          message: 'Do you want to select another query?',
          choices: ['Yes', 'No']
        });

        //continue or exit based on user's choice
        continueQuery = anotherQuery === 'Yes';
      } while (continueQuery);
    } catch (error) {
      //handle error
      if (error.code === grpc.status.UNAVAILABLE) {
        console.error(chalk.red('Error: Server is unavailable. Please try again later.'));
      } else {
        console.error(chalk.red('Error:', error.message));
      }
    }
  }
}

//export the main function for main_client.js to call
module.exports.main = main;

