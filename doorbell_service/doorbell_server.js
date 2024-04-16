const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = "smart_doorbell.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const smartHomeProto = grpc.loadPackageDefinition(packageDefinition).smart_home;

// Initial state
let silentMode = false;

// Define gRPC service method for LiveVideoFeed
function liveVideoFeed(call) {
  console.log('Request for Live Video Feed received');
  const videoUrl = "https://rb.gy/85vh2p";
  const description = "Playa de Los Cristianos - Tenerife Live";
  call.write({ liveVideoUrl: videoUrl });
  call.write({ description: description });
  call.end();
}

// Define gRPC service method for TodaysEvents
function todaysEvents(call) {
  console.log('Request for Today\'s Events received');
  const events = ["#1 event", "#2 event", "#3 event"];
  events.forEach(event => {
      const detectionType = ["human", "animal"];
      const randomType = detectionType[Math.floor(Math.random() * detectionType.length)];
      const eventStatement = `${event} with type: ${randomType} on ${new Date().toISOString().slice(0, 10)}`;
      call.write({ eventStatement });
  });
  call.end();
}

// Define gRPC service method for SilentModeStatus
function silentModeStatus(call, callback) {
  console.log('Request for Silent Mode Status received');
  callback(null, { isSilentModeOn: silentMode });
}

// Define gRPC service method for ToggleSilentMode
function toggleSilentMode(call, callback) {
  console.log('Request for Toggling Silent Mode received');
  silentMode = call.request.toggle;
  const message = silentMode ? "Silent mode turned on" : "Silent mode turned off";
  console.log('Silent Mode:', message);
  callback(null, { message });
}

// Create gRPC server
const server = new grpc.Server();

// Add gRPC service methods to the server
server.addService(smartHomeProto.Doorbell.service, {
    LiveVideoFeed: liveVideoFeed,
    TodaysEvents: todaysEvents,
    SilentModeStatus: silentModeStatus,
    ToggleSilentMode: toggleSilentMode
});

// Bind and start the server
server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log('Server started successfully, listening on port', port);
    }
});