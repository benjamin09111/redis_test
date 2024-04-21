require('dotenv').config();

const clientElephant = require("./db_connection");

var PROTO_PATH = './proto/demo.proto';

var grpc = require('@grpc/grpc-js');
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

function AddData(call, callback) {
  const query = `INSERT INTO people (id,name,age,city) VALUES (${call.request.id},'${call.request.name}',${call.request.age},'${call.request.city}');`;

  //query a elephant
  clientElephant.query(query)
  .then(result => {
    console.log('Insertado en la base de datos.');
  })
  .catch(err => {
    console.error('Error al ejecutar la consulta', err);
  });
}

function GetData(call) {
  const query = "SELECT id, name, age, city FROM people;";

  //query a elephant
  clientElephant.query(query)
  .then(result => {
    for(const data of result.rows){
      call.write(data);
    }
    call.end();
  })
  .catch(err => {
    console.error('Error al ejecutar la consulta', err);
  });
}

function GetUser(call){
  const query = `SELECT id, name, age, city FROM people WHERE name = '${call.request.name}';`;

  //query a elephant
  clientElephant.query(query)
  .then(result => {
    for(const data of result.rows){
      call.write(data);
    }
    call.end();
  })
  .catch(err => {
    console.error('Error al ejecutar la consulta', err);
  });
}

function GetUserNormal(call){
  const query = `SELECT id, name, age, city FROM people WHERE name = '${call.request.name}' AND city = '${call.request.city}';`;

  //query a elephant
  clientElephant.query(query)
  .then(result => {
    for(const data of result.rows){
      call.write(data);
    }
    call.end();
  })
  .catch(err => {
    console.error('Error al ejecutar la consulta', err);
  });
}

const IP = process.env.GRPC_FULL_IP;
const GRPC_PORT = process.env.GRPC_PORT

function main() {
  var server = new grpc.Server();
  server.addService(demo_proto.People.service, {
    AddData: AddData,
    GetData: GetData,
    GetUser: GetUser,
    GetUserNormal: GetUserNormal,
  });

  server.bindAsync(`${process.env.GRPC_FULL_IP}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log("gRPC server on port ",GRPC_PORT);
  });
}

main();
