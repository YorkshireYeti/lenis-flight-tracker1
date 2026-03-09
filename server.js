const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const API_KEY = "e5025315camshdc195fde2ccf1d8p179bc9jsn2d3f77b33509";

app.use(express.static(path.join(__dirname,"public")));

const airports={
GLA:{name:"Glasgow",lat:55.8719,lon:-4.43306},
DXB:{name:"Dubai",lat:25.2528,lon:55.3644},
BKK:{name:"Bangkok",lat:13.6900,lon:100.7501}
};

const routes={
EK28:{from:"GLA",to:"DXB"},
EK376:{from:"DXB",to:"BKK"},
EK375:{from:"BKK",to:"DXB"},
EK27:{from:"DXB",to:"GLA"}
};

function loadHistory(){
if(!fs.existsSync("history.json")) return [];
return JSON.parse(fs.readFileSync("history.json"));
}

function saveHistory(history){
fs.writeFileSync("history.json",JSON.stringify(history,null,2));
}

async function getFlightData(flight){

try{

const today=new Date().toISOString().split("T")[0];

const res=await fetch(
`https://aerodatabox.p.rapidapi.com/flights/number/${flight}/${today}?withLocation=false`,
{
headers:{
"X-RapidAPI-Key":API_KEY,
"X-RapidAPI-Host":"aerodatabox.p.rapidapi.com"
}
}
);

const data=await res.json();

if(Array.isArray(data) && data.length>0){
return data[0];
}

return null;

}catch(e){

console.log("API error:",flight);
return null;

}

}

async function updateHistory(){

let history=loadHistory();

for(const flight in routes){

let api=await getFlightData(flight);

if(!api) continue;

let status=api.status;

let last=[...history].reverse().find(h=>h.flight===api.number);

if(last && last.status===status) continue;

history.push({
time:new Date().toISOString(),
flight:api.number,
status:status
});

console.log("Logged:",api.number,status);

}

saveHistory(history);

}

app.get("/api/flights",async(req,res)=>{

let result=[];

for(const flight in routes){

let api=await getFlightData(flight);

if(!api) continue;

let route=routes[flight];

let depAirport=airports[route.from];
let arrAirport=airports[route.to];

result.push({

number:api.number,

status:api.status,

departure:{
airport:{
name:depAirport.name,
location:{
lat:depAirport.lat,
lon:depAirport.lon
}
},
scheduledTime:{
local:api.departure.scheduledTime.local
}
},

arrival:{
airport:{
name:arrAirport.name,
location:{
lat:arrAirport.lat,
lon:arrAirport.lon
}
},
scheduledTime:{
local:api.arrival.scheduledTime.local
}
}

});

}

res.json(result);

});

app.get("/history",(req,res)=>{
res.json(loadHistory());
});

updateHistory();
setInterval(updateHistory,60000);

const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{
console.log("Leni's Flight Tracker running");
});
