#!/bin/bash

# Function to stop servers
stop_servers() {
    # Find and kill all node processes related to the servers
    pkill -f "node ./doorbell_service/doorbell_server.js"
    pkill -f "node ./lighting_service/lighting_server.js"
    pkill -f "node ./thermostat_service/thermostat_server.js"

}

# Trap SIGINT (Ctrl+C) and SIGTERM signals to stop servers
trap stop_servers SIGINT SIGTERM

# Start servers in the background
./start_servers_linux.sh &

# Wait for a moment to ensure servers are up and running
sleep 3

# Open a new terminal window and run main_client.js
xterm -e "node main_client.js"

# When main_client.js exits, stop the servers
stop_servers
