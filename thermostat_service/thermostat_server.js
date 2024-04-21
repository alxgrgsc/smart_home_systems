const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

//load the protocol buffer definition
const packageDefinition = protoLoader.loadSync('smart_thermostat.proto', {});
const smartThermostat = grpc.loadPackageDefinition(packageDefinition).smart_home;

// Default states
let currentTemperature = 20.5;
let boostTemperature = 20;
let isBoostActive = false;
let boostTimeRemaining = 15;
let isHotWaterOn = false;

//create gRPC server
const server = new grpc.Server();

//implement the service methods
server.addService(smartThermostat.Thermostat.service, {
  TemperatureStatus: (call, callback) => {
    console.log('Request for Temperature Status received');
    console.log('Sending Temperature Status:', currentTemperature);
    callback(null, { currentTemperature: currentTemperature });
  },
  SetTemperature: (call, callback) => {
    console.log('Request to set temperature received');
    currentTemperature = call.request.setTemperature;
    console.log('Temperature set to:', currentTemperature);
    callback(null, { message: `Temperature set to ${currentTemperature}` });
  },
  BoostStatus: (call, callback) => {
    console.log('Request for Boost Status received');
    let boostStatusMessage = 'Boost Status: ';
    if (isBoostActive) {
      boostStatusMessage += `On ${boostTemperature} degrees ${boostTimeRemaining} minutes`;
    } else {
      boostStatusMessage += 'Off';
    }
    console.log(boostStatusMessage);
    callback(null, { isBoostActive: isBoostActive, boostTemperature: boostTemperature, boostTimeRemaining: boostTimeRemaining });
  },
  SetBoost: (call, callback) => {
    console.log('Request to set boost received');
    isBoostActive = call.request.setBoost;
    if (!isBoostActive) {
      currentTemperature = 20.5;
      boostTimeRemaining = 30;
    }
    console.log('Boost set to:', isBoostActive ? 'On' : 'Off');
    callback(null, { message: `Boost set to ${isBoostActive ? 'On' : 'Off'}` });
  },
  AdjustBoost: (call, callback) => {
    console.log('Request to adjust boost received');
    isBoostActive = true;
    boostTemperature = call.request.boostTemperature; // update boostTemperature
    boostTimeRemaining = call.request.boostTime;
    console.log(`Boost adjusted. Temperature: ${boostTemperature}, Time remaining: ${boostTimeRemaining}`);
    callback(null, { message: `Boost adjusted. Temperature: ${boostTemperature}, Time remaining: ${boostTimeRemaining}` });
  },
  HotWaterStatus: (call, callback) => {
    console.log('Request for Hot Water Status received');
    console.log('Sending Hot Water Status:', isHotWaterOn ? 'On' : 'Off');
    callback(null, { message: `${isHotWaterOn ? 'On' : 'Off'}` });
  },
  SetHotWater: (call, callback) => {
    console.log('Request to set hot water status received');
    isHotWaterOn = call.request.setHotWater;
    console.log('Hot water status set to:', isHotWaterOn ? 'On' : 'Off');
    callback(null, { message: `Hot water status set to ${isHotWaterOn ? 'On' : 'Off'}` });
  },
  ManageBoost: (call, callback) => {
    console.log('Request to manage boost received');
    if (call.request.boostTemperature && call.request.boostTime) {
      isBoostActive = true;
      boostTemperature = call.request.boostTemperature; // update boostTemperature
      boostTimeRemaining = call.request.boostTime;
      console.log(`Boost adjusted. Temperature: ${boostTemperature}, Time remaining: ${boostTimeRemaining}`);
      callback(null, { message: `Boost adjusted. Temperature: ${boostTemperature}, Time remaining: ${boostTimeRemaining}` });
    } else {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Invalid request. boostTemperature and boostTime are required to manage boost.',
      });
    }
  },
});

//start the server
server.bindAsync('localhost:50053', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running on http://localhost:50053');
});