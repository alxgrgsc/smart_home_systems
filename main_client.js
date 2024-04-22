const thermostatClient = require('./thermostat_client');
const lightClient = require('./lighting_client');
const doorClient = require('./doorbell_client');
const inquirer = require('inquirer');

async function main() {
  let continueQuery = true;

  do {
    const { clientChoice } = await inquirer.prompt({
      type: 'list',
      name: 'clientChoice',
      message: 'Which client do you want to interact with?',
      choices: ['Thermostat', 'Light', 'Door'],
    });

    switch (clientChoice) {
      case 'Thermostat':
        console.log('Loading Thermostat Client...');
        await thermostatClient.main()();
        break;

      case 'Light':
        console.log('Loading Light Client...');
        await lightClient.main()();
        break;
      case 'Door':
        console.log('Loading Doorbell Client...');
        await doorClient.main()();
        break;
      default:
        console.log('Invalid choice. Please select an option from the list.');
        break;
    }

    const { anotherQuery } = await inquirer.prompt({
      type: 'input',
      name: 'anotherQuery',
      message: 'Do you want to select another client? (y/n)',
      validate: function (value) {
        var valid = value.toLowerCase() === 'y' || value.toLowerCase() === 'n';
        return valid || 'Please enter y for Yes or n for No';
      },
    });

    continueQuery = anotherQuery.toLowerCase() === 'y';
  } while (continueQuery);
}

main();