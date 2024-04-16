const grpc = require('@grpc/grpc-js');
const chalk = require('chalk');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const packageDefinition = protoLoader.loadSync('smart_doorbell.proto', {});
const smartDoorbell = grpc.loadPackageDefinition(packageDefinition).smart_home;

const client = new smartDoorbell.Doorbell('localhost:50052', grpc.credentials.createInsecure());

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  let continueQuery = true;

  do {
    console.log();
    console.log(chalk.yellow('Select an operation:'));
    console.log('1: Live Video Feed');
    console.log('2: Today\'s Events');
    console.log('3: Silent Mode Status');
    console.log('4: Toggle Silent Mode');

    const choice = await askQuestion('Enter choice: ');
    console.log();

    switch (choice) {
      case '1':
        try {
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
              console.log('End of Live Video Feed');
              console.log();
              resolve();
            });
          });
        } catch (error) {
          console.error('Error handling Live Video Feed:', error);
        }
        break;
      case '2':
        try {
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
        } catch (error) {
          console.error('Error handling TodaysEvents:', error);
        }
        break;
      case '3':
        try {
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
        } catch (error) {
          console.error('Error getting Silent Mode Status:', error);
        }
        break;
      case '4':
        try {
          const toggleInput = await askQuestion('Toggle silent mode on (enter 1) or off (enter 0): ');
          const toggle = toggleInput.trim() === '1';
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
        } catch (error) {
          console.error('Error toggling Silent Mode:', error);
        }
        break;
      default:
        console.log('Invalid choice. Please select a number between 1 and 4.');
        break;
    }

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

  rl.close();
}

main();
