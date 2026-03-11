const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const OPENSKY_USER = "[lukemartin2804@gmail.com](mailto:lukemartin2804@gmail.com)";
const OPENSKY_PASS = process.env.OPENSKY_PASS;

app.use(express.static(path.join(__dirname,"public")));

const callsigns = ["UAE28","UAE376","UAE375","UAE27"];

function loadLog(){
if(!fs.existsSync("journeylog.json")) return [];
return JSON.parse(fs.readFileSync("journeylog.json"));
}

function saveLog(log){
fs.writeFileSync("journeylog.json",JSON.stringify(log,null,2));
}

async function getAircraft(){

try{

const res = await fetch(
"https://opensky-network.org/api/states/all",
{
headers:{
"Authorization":
"Basic "+Buffer.from(OPENSKY_USER+":"+OPENSKY_PASS).toString("base64")
}
}
);

const data = await res.json();

return data.states || [];

}catch(e){

console.log("OpenSky API error");

return [];

}

}

app.get("/api/flights",async(req,res)=>{

let states = await getAircraft();

let flights=[];

callsigns.forEach(call =>{

let plane = states.find(s =>
s[1] && s[1].trim() === call
);

if(plane){

flights.push({

number:call.replace("UAE","EK"),
lat:plane,
lon:plane,
altitude:plane,
velocity:plane,
status:"active"

});

}else{

flights.push({

number:call.replace("UAE","EK"),
status:"not_airborne"

});

}

});

res.json(flights);

});

app.get("/journeylog",(req,res)=>{
res.json(loadLog());
});

app.get("/stats",(req,res)=>{

let log = loadLog();

let completed = log.filter(l=>l.status==="completed").length;
let cancelled = log.filter(l=>l.status==="cancelled").length;

let total = completed + cancelled;

let success = total>0 ? Math.round((completed/total)*100) : 0;

res.json({
completed,
cancelled,
success,
total
});

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Leni's Flight Tracker running");
});
