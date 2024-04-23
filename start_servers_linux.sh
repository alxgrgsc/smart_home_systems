#!/bin/bash

# Start first gRPC server
node ./lighting_service/lighting_server.js &

# Start second gRPC server
node ./doorbell_service/doorbell_server.js &

# Start third gRPC server
node ./thermostat_service/thermostat_server.js &
