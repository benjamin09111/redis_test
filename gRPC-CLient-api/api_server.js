const express = require("express");
require('dotenv').config();
var bodyParser = require("body-parser");
var morgan = require("morgan");
var cors = require("cors");
const client = require("./gRPC_client");

const connectRedis = require("./configRedis.js");
const connectRedisFather = require("./configRedisFather.js");
const connectRedisChild = require("./configRedisCopia.js");
const connectRedisNewYork = require("./particionado/NY.js");
const connectRedisNotNewYork = require("./particionado/NNY.js");

const app = express();

const port = process.env.API_PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//cache middleware normal
const cache = async (req, res, next) => {
    const name = req.params["name"];
    const city = req.params["city"];
    const search = `${name}_${city}`;

    const redisClient = await connectRedis();

    const responseRedis = await redisClient.get(search);

    if (responseRedis) {
        res.status(200).json({
            "response": responseRedis
        })
    }
    else {
        next();
    }
}

//cache middleware particionado: dependiendo del país accede a cierto redis
const cacheParticionado = async (req, res, next) => {
    const name = req.params["name"];
    const city = req.params["city"];
    const search = `${name}_${city}`;

    if (city == "New York") {
        console.log("Accediendo a Redis de New York");
        const redisClient = await connectRedisNewYork();

        const responseRedis = await redisClient.get(search);

        if (responseRedis) {
            res.status(200).json({
                "response": responseRedis
            })
        }
        else {
            next();
        }
    } else {
        console.log("Accediendo a Redis no de New York");
        const redisClient = await connectRedisNotNewYork();

        const responseRedis = await redisClient.get(search);

        if (responseRedis) {
            res.status(200).json({
                "response": responseRedis
            })
        }
        else {
            next();
        }
    }


}

//cache middleware replicado: si el primero falla, se accede al segundo
const cacheReplicado = async (req, res, next) => {
    const name = req.params["name"];
    const city = req.params["city"];
    const search = `${name}_${city}`;

    try {
        const redisClient = await connectRedisFatherT();
        const responseRedis = await redisClient.get(search);

        if (responseRedis) {
            res.status(200).json({
                "response": responseRedis
            })
        }
        else {
            next();
        }

    } catch (e) {
        console.log("Base de datos padre no disponible. Accediendo a copia...");

        const redisClient = await connectRedisChild();

        const responseRedis = await redisClient.get(search);

        if (responseRedis) {
            res.status(200).json({
                "response": responseRedis
            })
        }
        else {
            next();
        }

    }


}

//routes generales de prueba
app.use("/people", require("./routes/people.js"))

///redis routes
app.get("/normal/user/:name", cache, async (req, res) => {
    const name = req.params["name"];
    const rows = [];

    const redisClient = await connectRedis();

    const userSearched = {
        "name": name
    }

    const call = client.GetUser(userSearched);

    call.on("data", (data) => {
        rows.push(data);
    });

    call.on("end", () => {
        redisClient.set(name, JSON.stringify(rows[0]));

        res.status(200).json({ data: rows });
    });

    call.on("error", (e) => {
        res.status(400).json({ message: e })
    });
});

//HAY QUE VER A QUÉ REDIS AGREGARLE EL DATO AHORA...

//tipos de redis LRU
app.get("/normal/:name/:city", cache, async (req, res) => {
    const name = req.params.name;
    var city = req.params.city;
    const key = `${name}_${city}`;
    const rows = [];

    const redisClient = await connectRedis();

    if(city == "New_York"){
        city = "New York"
    }

    const userSearched = {
        "name": name,
        "city": city
    }

    const call = client.GetUserNormal(userSearched);

    call.on("data", (data) => {
        rows.push(data);
    });

    call.on("end", () => {
        redisClient.set(key, JSON.stringify(rows[0]));

        res.status(200).json({ data: rows });
    });

    call.on("error", (e) => {
        res.status(400).json({ message: e })
    });

})

app.get("/particionado/:name/:city", cacheParticionado, async (req, res) => {
    const name = req.params.name;
    const city = req.params.city;
    const key = `${name}_${city}`;
    const rows = [];

    if (city == "New_York") {
        const redisClient = await connectRedisNewYork();

        const userSearched = {
            "name": name,
            "city": "New York"
        }

        const call = client.GetUserNormal(userSearched);

        call.on("data", (data) => {
            rows.push(data);
        });

        call.on("end", () => {
            redisClient.set(key, JSON.stringify(rows[0]));

            res.status(200).json({ data: rows });
        });

        call.on("error", (e) => {
            res.status(400).json({ message: e })
        });
    } else {
        const redisClient = await connectRedisNotNewYork();

        const userSearched = {
            "name": name,
            "city": city
        }

        const call = client.GetUserNormal(userSearched);

        call.on("data", (data) => {
            rows.push(data);
        });

        call.on("end", () => {
            redisClient.set(key, JSON.stringify(rows[0]));

            res.status(200).json({ data: rows });
        });

        call.on("error", (e) => {
            res.status(400).json({ message: e })
        });
    }

})

const copyToChild = async (key, result)=>{
    const redisClient = await connectRedisChild();

    redisClient.set(key, result);
}

app.get("/replicado/:name/:city", cacheReplicado, async (req, res) => {
    const name = req.params.name;
    const city = req.params.city;
    const key = `${name}_${city}`
    const rows = [];

    try{
        const redisClient = await connectRedisFather();
        console.log("komol!");
        const userSearched = {
            "name": name,
            "city": city
        }
    
        const call = client.GetUserNormal(userSearched);
    
        call.on("data", (data)=>{
            rows.push(data);
        });
    
        call.on("end", async()=>{
            redisClient.set(key, JSON.stringify(rows[0]));

            await copyToChild(key,JSON.stringify(rows[0]));
            
            res.status(200).json({data: rows});
        });
    
        call.on("error", (e)=>{
            res.status(400).json({message: e})
        });

    }catch(e){
        console.log("Redis padre inactivo... Pasando a hijo.");
        const redisClient2 = await connectRedisChild();

        const userSearched = {
            "name": name,
            "city": city
        }
    
        const call = client.GetUserNormal(userSearched);
    
        call.on("data", (data)=>{
            rows.push(data);
        });
    
        call.on("end", ()=>{
            redisClient2.set(key, JSON.stringify(rows[0]));
            
            res.status(200).json({data: rows});
        });
    
        call.on("error", (e)=>{
            res.status(400).json({message: e})
        });
    }
})

app.listen(port, () => {
    console.log("Servidor en el puerto", port);
})