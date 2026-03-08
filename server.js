const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname,"public")));

const routes = {

EK28:{
number:"EK 28",
departure:{airport:{name:"Glasgow",location:{lat:55.8719,lon:-4.43306}}},
arrival:{airport:{name:"Dubai",location:{lat:25.2528,lon:55.3644}}},
departureTime:"13:35",
arrivalTime:"21:30"
},

EK376:{
number:"EK 376",
departure:{airport:{name:"Dubai",location:{lat:25.2528,lon:55.3644}}},
arrival:{airport:{name:"Bangkok",location:{lat:13.6900,lon:100.7501}}},
departureTime:"22:30",
arrivalTime:"07:35"
},

EK375:{
number:"EK 375",
departure:{airport:{name:"Bangkok",location:{lat:13.6900,lon:100.7501}}},
arrival:{airport:{name:"Dubai",location:{lat:25.2528,lon:55.3644}}},
departureTime:"09:30",
arrivalTime:"13:35"
},

EK27:{
number:"EK 27",
departure:{airport:{name:"Dubai",location:{lat:25.2528,lon:55.3644}}},
arrival:{airport:{name:"Glasgow",location:{lat:55.8719,lon:-4.43306}}},
departureTime:"14:45",
arrivalTime:"19:05"
}

};

function buildTodayTime(time){

let parts=time.split(":");

let d=new Date();

d.setUTCHours(parseInt(parts[0]));
d.setUTCMinutes(parseInt(parts[1]));
d.setUTCSeconds(0);

return d;

}

function getFlightTimes(dep,arr){

let depTime=buildTodayTime(dep);
let arrTime=buildTodayTime(arr);

if(arrTime.getTime()<depTime.getTime()){
arrTime.setUTCDate(arrTime.getUTCDate()+1);
}

return {depTime,arrTime};

}

function calculateStatus(dep,arr){

let now=Date.now();

let times=getFlightTimes(dep,arr);

let depMs=times.depTime.getTime();
let arrMs=times.arrTime.getTime();

if(now<depMs) return "Scheduled";

if(now>=depMs && now<=arrMs) return "In Progress";

if(now>arrMs) return "Completed";

}

function loadHistory(){

if(!fs.existsSync("history.json")){
return [];
}

return JSON.parse(fs.readFileSync("history.json"));

}

function saveHistory(history){

fs.writeFileSync("history.json",JSON.stringify(history,null,2));

}

function updateHistory(){

let history=loadHistory();

for(const key in routes){

let r=routes[key];

let status=calculateStatus(r.departureTime,r.arrivalTime);

let last=[...history].reverse().find(h=>h.flight===r.number);

if(last && last.status===status) continue;

history.push({
time:new Date().toISOString(),
flight:r.number,
status:status
});

console.log("Logged:",r.number,status);

}

saveHistory(history);

}

app.get("/api/flights",(req,res)=>{

let result=[];

for(const key in routes){

let r=routes[key];

let times=getFlightTimes(r.departureTime,r.arrivalTime);

let status=calculateStatus(r.departureTime,r.arrivalTime);

result.push({

number:r.number,

status:status,

departure:{
airport:r.departure.airport,
scheduledTime:{local:times.depTime}
},

arrival:{
airport:r.arrival.airport,
scheduledTime:{local:times.arrTime}
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

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Leni's Flight Tracker running");
});
