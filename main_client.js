const thermostatClient = require('./thermostat_service/thermostat_client');
const lightClient = require('./lighting_service/lighting_client');
const doorClient = require('./doorbell_service/doorbell_client');
console.log('Doorbell');
const inquirer = require('inquirer');

async function main() {
  let continueQuery = true;

  do {
    const { clientChoice } = await inquirer.prompt({
      type: 'list',
      name: 'clientChoice',
      message: 'Which client do you want to interact with?',
      choices: ['Hive Thermostat', 'Hue Lighting', 'Eufy Doorbell'],
    });

    switch (clientChoice) {
      case 'Hive Thermostat':
        console.log('Loading Thermostat Client...');
        await thermostatClient.main()();
        break;

      case 'Hue Lighting':
        console.log('Loading Light Client...');
        await lightClient.main()();
        break;
      case 'Eufy Doorbell':
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