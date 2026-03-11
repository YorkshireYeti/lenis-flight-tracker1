const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const API_KEY = "e5025315camshdc195fde2ccf1d8p179bc9jsn2d3f77b33509";

app.use(express.static(path.join(__dirname,"public")));

const airports = {
GLA:{name:"Glasgow",lat:55.8719,lon:-4.43306},
DXB:{name:"Dubai",lat:25.2528,lon:55.3644},
BKK:{name:"Bangkok",lat:13.6900,lon:100.7501}
};

const routes = {
EK28:{from:"GLA",to:"DXB"},
EK376:{from:"DXB",to:"BKK"},
EK375:{from:"BKK",to:"DXB"},
EK27:{from:"DXB",to:"GLA"}
};

function loadLog(){
if(!fs.existsSync("journeylog.json")) return [];
return JSON.parse(fs.readFileSync("journeylog.json"));
}

function saveLog(log){
fs.writeFileSync("journeylog.json",JSON.stringify(log,null,2));
}

async function getFlight(flight){

try{

const res = await fetch(
`http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flight}`
);

const data = await res.json();

if(data.data && data.data.length>0){
return data.data[0];
}

return null;

}catch(e){

console.log("API error",flight);
return null;

}

}

async function updateJourneyLog(){

let log = loadLog();

for(const flight in routes){

let api = await getFlight(flight);

if(!api) continue;

let status = api.flight_status;

if(status !== "landed" && status !== "cancelled") continue;

let date = new Date().toISOString().slice(0,10);

let existing = log.find(l=>l.flight===flight && l.date===date);

if(existing) continue;

log.push({
flight:flight,
date:date,
status:status
});

}

saveLog(log);

}

app.get("/api/flights",async(req,res)=>{

let result=[];

for(const flight in routes){

let api = await getFlight(flight);

let route = routes[flight];

let depAirport = airports[route.from];
let arrAirport = airports[route.to];

let status="scheduled";
let depTime=null;
let arrTime=null;

if(api){

status = api.flight_status;

depTime = api.departure?.scheduled || null;
arrTime = api.arrival?.scheduled || null;

}

result.push({

number:flight,
status:status,

departure:{
airport:{
name:depAirport.name,
location:{lat:depAirport.lat,lon:depAirport.lon}
},
scheduledTime:{local:depTime}
},

arrival:{
airport:{
name:arrAirport.name,
location:{lat:arrAirport.lat,lon:arrAirport.lon}
},
scheduledTime:{local:arrTime}
}

});

}

res.json(result);

});

app.get("/journeylog",(req,res)=>{
res.json(loadLog());
});

app.get("/stats",(req,res)=>{

let log = loadLog();

let completed = log.filter(l=>l.status==="landed").length;
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

setInterval(updateJourneyLog,60000);

