# Smart Home System

The Smart Home System comprises a suite of gRPC services tailored for managing and overseeing a range of smart home devices(eufy Doorbell, Hive Thermostat and Hue Lighting). This project is structured around three core elements: The Doorbell System, the Lighting System and the Thermostat System

## Doorbell System

The Doorbell System facilitates various doorbell operations, such as live video feed streaming, event notifications, and silent mode control. Users can seamlessly engage with the doorbell system via a client application, enabling them to access live video feeds, review daily events and toggle silent mode.

## Lighting System

The Lighting System empowers users to effectively oversee and manage smart lighting devices throughout their homes. It offers an array of features, including real-time status checks, brightness level adjustments, color modifications, and simple on/off controls. Through a dedicated client application, users can effortlessly tailor their lighting preferences, ensuring a customized and responsive home lighting environment.

## Thermostat System
The Thermostat System provides comprehensive temperature control functionalities, allowing users to monitor and regulate the indoor climate of their homes. Key features include querying the current temperature, setting desired temperature levels, managing boost settings for heating, and checking the status of the hot water system. Through the client application, users can maintain optimal comfort levels and maximize energy efficiency.


## Installation

To effortlessly deploy and operate the Smart Home System, adhere to these straightforward installation steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Start each server by running three different terminals with the command "node /desired_service/service_server.js"
4. Start the main client by running "node main_client.js"
5. Access the client application to seamlessly interact with the system.

## For Linux

I have made a script that will run all the server files and start the main_client as well

For this you need to install xterm on linux by running "sudo apt install xterm"

After that, from the project directory, start a new terminal and run "./run_client_linux.sh"

## Usage

Once the server is operational, leverage the intuitive client application to seamlessly interact with all three services. Simply follow the prompts within the client application to execute diverse actions, ranging from viewing live video feeds to fine-tuning lighting configurations and managing the temperature in the household.
