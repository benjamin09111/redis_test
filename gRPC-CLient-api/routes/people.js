var express = require("express");
var router = express.Router();
const client = require("../gRPC_client");

router.post("/add10k", (req,res)=>{
    const data10k = {
        id: req.body.id,
        name: req.body.name,
        age: req.body.age,
        city: req.body.city,
    }

    client.AddData(data10k, function(err, response) {
        res.status(200).json({message: response.message})
    });

});

router.get("/get10k", (req,res)=>{
    const rows = [];

    const call = client.GetData();
    
    call.on("data", (data)=>{
        rows.push(data);
    })
    call.on("end", ()=>{
        res.status(200).json({data: rows});
    })
    call.on("error", (e)=>{
        res.status(400).json({message: e})
    })
});

module.exports = router;