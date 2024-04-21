require('dotenv').config();
var PROTO_PATH = './proto/demo.proto';
var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
const CLIENT_FULL_IP_SERVER_GRPC = process.env.CLIENT_FULL_IP_SERVER_GRPC;
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var demo_proto = grpc.loadPackageDefinition(packageDefinition).demo;

var argv = parseArgs(process.argv.slice(2), {
  string: 'target'
});
var target;
if (argv.target) {
  target = argv.target;
} else {
  target = `${CLIENT_FULL_IP_SERVER_GRPC}`;
}
var client = new demo_proto.People(target, grpc.credentials.createInsecure());
var user;

module.exports = client;
