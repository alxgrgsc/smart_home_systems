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