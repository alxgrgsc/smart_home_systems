const grpc = require('@grpc/grpc-js');
const chalk = require('chalk');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

//readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('smart_lighting.proto', {});
const smartLighting = grpc.loadPackageDefinition(packageDefinition).smart_home;

//create gRPC client
const client = new smartLighting.Lighting('localhost:50051', grpc.credentials.createInsecure());

//function to ask user a question and return a promise
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

//main
async function main() {
  let continueQuery = true;

  //loop until user exits
  do {
    console.log();
    console.log(chalk.yellow('Select an operation:'));
    console.log('1: Light Status');
    console.log('2: Brightness Status');
    console.log('3: Colour Status');
    console.log('4: Turn On/Off');
    console.log('5: Adjust Brightness');
    console.log('6: Change Colour');

    const choice = await askQuestion('Enter choice: ');

    switch (choice) {
      //get lightStatus
      case '1':
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
      case '2':
        //get brightnessStatus
        await new Promise((resolve, reject) => {
          client.BrightnessStatus({}, (error, response) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log('Brightness level:', response.brightnessLevel);
              resolve();
            }
          });
        });
        break;
      case '3':
        //get colourStatus  
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

      case '4':
        //turn light on/off
        const isOnInput = await askQuestion('Turn light on (enter 1) or off (enter 0): ');
        const isOn = isOnInput.trim() === '1'; // Convert input to boolean

        if (isOnInput.trim() !== '0' && isOnInput.trim() !== '1') {
          console.log('Invalid input. Please enter 0 or 1.');
          break;
        }

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
        break;

      case '5':
        //adjust brightness
        const newBrightnessLevel = await askQuestion('Enter new brightness level(0-100): ');
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

      case '6':
        //change colour
        const newColour = await askQuestion('Enter new colour (white, red, green, blue, yellow, orange, purple, pink): ');
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
        console.log('Invalid choice. Please select a number between 1 and 6.');
        break;
    }
    //ask user if they want to continue
    let validAnswer = false;
    let anotherQuery = '';
    while (!validAnswer) {
      anotherQuery = await askQuestion('Do you want to select another query? (y/n): ');
      if (anotherQuery.toLowerCase() === 'y' || anotherQuery.toLowerCase() === 'n') {
        validAnswer = true;
      } else {
        console.log('Invalid input. Please enter "y" or "n".');
      }
    }
    continueQuery = anotherQuery.toLowerCase() === 'y';
  } while (continueQuery);

  //close readline interface
  rl.close();
}

//call main function
main();
