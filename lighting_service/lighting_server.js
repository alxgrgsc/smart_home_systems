const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = "smart_lighting.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const smartHomeProto = grpc.loadPackageDefinition(packageDefinition).smart_home;

// Default states
let lightStatus = 0; // 0 off / 1 on
let brightnessLevel = 100; // brightness
let currentColour = 'white'; // colour

const ALLOWED_COLOURS = ['white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink'];

// gRPC service method for LightStatus
function getLightStatus(call, callback) {
  console.log('Request for Light Status received');
  let statusMessage = lightStatus ? 'Light is on' : 'Light is off';
  console.log('Sending Light Status:', statusMessage);
  callback(null, { message: statusMessage });
}

// gRPC service method for BrightnessStatus
function getBrightnessStatus(call, callback) {
    console.log('Request for Brightness Status received');
    brightnessLevel = Math.max(0, Math.min(100, brightnessLevel));
    console.log('Sending Brightness Status:', brightnessLevel);
    callback(null, { brightnessLevel: brightnessLevel });
}

// gRPC service method for AdjustBrightness
function adjustBrightness(call, callback) {
  console.log('Request to adjust brightness received');
  const newBrightnessLevel = call.request.newBrightnessLevel;
  brightnessLevel = Math.max(0, Math.min(100, newBrightnessLevel));
  console.log('Brightness level:', brightnessLevel);
  callback(null, { message: `Brightness level: changed to ${brightnessLevel}` });
}

// gRPC service method for ChangeLightStatus
function changeLightStatus(call, callback) {
  console.log('Request to change light status received');
  let newLightStatus = call.request.isOn;
  if (typeof newLightStatus !== 'boolean') {
    const errorMessage = 'Invalid value for new light status. Must be a boolean (true or false).';
    console.error(errorMessage);
    callback({ code: grpc.status.INVALID_ARGUMENT, message: errorMessage });
    return;
  }
  lightStatus = newLightStatus;
  console.log('New light status:', lightStatus ? 'on' : 'off');
  callback(null, { message: `Light status: changed to ${lightStatus ? 'on' : 'off'}` });
}

// gRPC service method for ColourStatus
function getColourStatus(call, callback) {
    console.log('Request for Colour Status received');
    console.log('Sending Colour Status:', currentColour);
    callback(null, { colour: currentColour });
}

// gRPC service method for ChangeColour
function changeColour(call, callback) {
    console.log('Request to change colour received');
    const newColour = call.request.colour.toLowerCase(); 
    if (ALLOWED_COLOURS.includes(newColour)) {
        currentColour = newColour;
        console.log('Colour:', currentColour);
        callback(null, { message: `Colour changed to ${newColour}` });
    } else {
        callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Invalid colour. Allowed colours: ' + ALLOWED_COLOURS.join(', ') });
    }
}

//create gRPC server
const server = new grpc.Server();

//add gRPC service methods to the server
server.addService(smartHomeProto.Lighting.service, {
    LightStatus: getLightStatus,
    BrightnessStatus: getBrightnessStatus,
    ColourStatus: getColourStatus,
    ChangeColour: changeColour,
    AdjustBrightness: adjustBrightness,
    ChangeLightStatus: changeLightStatus
});

//bind and start the server
server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log('Server started successfully, listening on port', port);
    }
});