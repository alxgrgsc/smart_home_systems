// Purpose: Client for the smart lighting service. It allows the user to interact with the lighting service by querying the current status of the light, turning the light on or off, adjusting the brightness level, and changing the colour of the light.

//import modules
const grpc = require('@grpc/grpc-js');
const chalk = require('chalk');
const protoLoader = require('@grpc/proto-loader');
const inquirer = require('inquirer');

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('./doorbell_service/smart_doorbell.proto', {});
const smartDoorbell = grpc.loadPackageDefinition(packageDefinition).smart_home;


function main() {
  return async function () {
    try {
      //create a new gRPC client instance
      const client = new smartDoorbell.Doorbell('localhost:50052', grpc.credentials.createInsecure());
      let continueQuery = true;

      do {
        //blank line for spacing
        console.log();

        //prompt user to select an option
        const { choice } = await inquirer.prompt({
          type: 'list',
          name: 'choice',
          message: chalk.yellow('Eufy Doorbell:'),
          choices: [
            'Live Video Feed',
            'Today\'s Events',
            'Silent Mode Status',
            'Toggle Silent Mode',
            new inquirer.Separator(),
          ],
        });

        //handle user's choice
        switch (choice) {
          case 'Live Video Feed':
            //live video feed
            await new Promise((resolve, reject) => {
              const liveVideoFeedStream = client.LiveVideoFeed({});
              liveVideoFeedStream.on('data', response => {
                if (response.liveVideoUrl) {
                  console.log('Live Video Feed URL:', chalk.yellow(response.liveVideoUrl));
                }
                if (response.description) {
                  console.log('Description:', chalk.yellow(response.description));
                  console.log();
                }
              });
              liveVideoFeedStream.on('error', error => {
                reject(error);
              });
              liveVideoFeedStream.on('end', () => {
                console.log();
                resolve();
              });
            });
            break;
          case 'Today\'s Events':
            //today's events
            await new Promise((resolve, reject) => {
              const todaysEventsStream = client.TodaysEvents({});
              todaysEventsStream.on('data', event => {
                console.log();
                console.log('Event:', chalk.yellow(event.eventStatement));
              });
              todaysEventsStream.on('error', error => {
                reject(error);
              });
              todaysEventsStream.on('end', () => {
                console.log();
                console.log('End of events');
                resolve();
              });
            });
            break;
          case 'Silent Mode Status':
            //silent mode status
            await new Promise((resolve, reject) => {
              client.SilentModeStatus({}, (error, response) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  const status = response.isSilentModeOn ? 'on' : 'off';
                  console.log('Silent Mode Status:', chalk.yellow(status));
                  console.log();
                  resolve();
                }
              });
            });
            break;
          case 'Toggle Silent Mode':
            const { toggleInput } = await inquirer.prompt({
              type: 'list',
              name: 'toggleInput',
              message: 'Toggle silent mode:',
              choices: ['On', 'Off'],
            });
            const toggle = toggleInput === 'On';

            //toggle silent mode 
            await new Promise((resolve, reject) => {
              client.ToggleSilentMode({ toggle }, (error, response) => {
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
      //handle errors
      if (error.code === grpc.status.UNAVAILABLE) {
        console.error(chalk.red('Error: Server is unavailable. Please try again later.'));
      } else {
        console.error(chalk.red('Error:', error.message));
      }
    }
  }
}

//export main function for main_client.js to call
module.exports.main = main;