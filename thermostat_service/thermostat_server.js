//import modules
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('./thermostat_service/smart_thermostat.proto', {});
const smartThermostat = grpc.loadPackageDefinition(packageDefinition).smart_home;

//initialize default states
let currentTemperature = 20.5;
let boostTemperature = 20;
let isBoostActive = false;
let boostTimeRemaining = 15;
let isHotWaterOn = false;

//create a new gRPC server
const server = new grpc.Server();

//method to get the current temperature
function temperatureStatus(call, callback) {
  console.log('Request for Temperature Status received');
  console.log('Sending Temperature Status:', currentTemperature);
  callback(null, { currentTemperature: currentTemperature });
}

//method to set the temperature
function setTemperature(call, callback) {
  console.log('Request to set temperature received');
  currentTemperature = call.request.setTemperature;
  console.log('Temperature set to:', currentTemperature + '\u00B0C');
  callback(null, { message: `Temperature set to ${currentTemperature}\u00B0C` });
}

//method to get the boost status
function boostStatus(call, callback) {
  console.log('Request for Boost Status received');
  let boostStatusMessage = 'Boost Status: ';
  if (isBoostActive) {
    boostStatusMessage += ` ${boostTemperature}\u00B0C / ${boostTimeRemaining} minutes`;
  } else {
    boostStatusMessage += 'Off';
  }
  console.log(boostStatusMessage);
  callback(null, { isBoostActive: isBoostActive, boostTemperature: boostTemperature, boostTimeRemaining: boostTimeRemaining });
}

//method to manage the boost
function manageBoost(call, callback) {
  console.log('Request to manage boost received');
  if (call.request.boostTemperature && call.request.boostTime) {
    isBoostActive = true;
    boostTemperature = call.request.boostTemperature; // update boostTemperature
    boostTimeRemaining = call.request.boostTime;
    console.log(`Boost adjusted. Temperature: ${boostTemperature}\u00B0C, Time remaining: ${boostTimeRemaining} minutes`);
    callback(null, { message: `Boost adjusted. Temperature: ${boostTemperature}\u00B0C, Time remaining: ${boostTimeRemaining} minutes` });
  } else {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Invalid request. boostTemperature and boostTime are required to manage boost.',
    });
  }
}

//method to set the boost status
function setBoost(call, callback) {
  console.log('Request to set boost received');
  isBoostActive = call.request.setBoost;
  if (!isBoostActive) {
    currentTemperature = 20.5;
    boostTimeRemaining = 30;
  }
  console.log('Boost set to:', isBoostActive ? 'On' : 'Off');
  callback(null, { message: `Boost set to: ${isBoostActive ? 'On' : 'Off'}` });
}

//method to adjust the boost
function adjustBoost(call, callback) {
  console.log('Request to adjust boost received');
  isBoostActive = true;
  boostTemperature = call.request.boostTemperature; // update boostTemperature
  boostTimeRemaining = call.request.boostTime;
  console.log(`Boost adjusted. Temperature: ${boostTemperature}\u00B0C / Time remaining: ${boostTimeRemaining}`);
  callback(null, { message: `Boost adjusted. Temperature: ${boostTemperature}\u00B0C, Time remaining: ${boostTimeRemaining} minutes` });
}

//method to get the hot water status
function hotWaterStatus(call, callback) {
  console.log('Request for Hot Water Status received');
  console.log('Sending Hot Water Status:', isHotWaterOn ? 'On' : 'Off');
  callback(null, { message: `${isHotWaterOn ? 'On' : 'Off'}` });
}

//method to set the hot water status
function setHotWater(call, callback) {
  console.log('Request to set hot water status received');
  isHotWaterOn = call.request.setHotWater;
  console.log('Hot water status set to:', isHotWaterOn ? 'On' : 'Off');
  callback(null, { message: `Hot water status set to ${isHotWaterOn ? 'On' : 'Off'}` });
}

// add the service methods to the server
server.addService(smartThermostat.Thermostat.service, {
  TemperatureStatus: temperatureStatus,
  SetTemperature: setTemperature,
  BoostStatus: boostStatus,
  ManageBoost: manageBoost,
  SetBoost: setBoost,
  AdjustBoost: adjustBoost,
  HotWaterStatus: hotWaterStatus,
  SetHotWater: setHotWater
});

// bind and start the server
server.bindAsync('127.0.0.1:50053', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log('Server started successfully, listening on port', port);
  }
});