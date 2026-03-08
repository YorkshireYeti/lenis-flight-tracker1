const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const API_KEY = "e5025315camshdc195fde2ccf1d8p179bc9jsn2d3f77b33509";

app.use(express.static(path.join(__dirname,"public")));

const routes = {

EK28:{
number:"EK 28",
departure:{
airport:{
name:"Glasgow",
location:{lat:55.8719,lon:-4.43306}
}
},
arrival:{
airport:{
name:"Dubai",
location:{lat:25.2528,lon:55.3644}
}
},
departureTime:"2026-03-08T13:35:00Z",
arrivalTime:"2026-03-08T21:30:00Z"
},

EK376:{
number:"EK 376",
departure:{
airport:{
name:"Dubai",
location:{lat:25.2528,lon:55.3644}
}
},
arrival:{
airport:{
name:"Bangkok",
location:{lat:13.6900,lon:100.7501}
}
},
departureTime:"2026-03-08T22:30:00Z",
arrivalTime:"2026-03-09T07:35:00Z"
},

EK375:{
number:"EK 375",
departure:{
airport:{
name:"Bangkok",
location:{lat:13.6900,lon:100.7501}
}
},
arrival:{
airport:{
name:"Dubai",
location:{lat:25.2528,lon:55.3644}
}
},
departureTime:"2026-03-09T09:30:00Z",
arrivalTime:"2026-03-09T13:35:00Z"
},

EK27:{
number:"EK 27",
departure:{
airport:{
name:"Dubai",
location:{lat:25.2528,lon:55.3644}
}
},
arrival:{
airport:{
name:"Glasgow",
location:{lat:55.8719,lon:-4.43306}
}
},
departureTime:"2026-03-09T14:45:00Z",
arrivalTime:"2026-03-09T19:05:00Z"
}

};

function loadHistory(){

if(!fs.existsSync("history.json")){
return [];
}

return JSON.parse(fs.readFileSync("history.json"));

}

app.get("/api/flights",(req,res)=>{

let result=[];

for(const key in routes){

let r=routes[key];

result.push({

number:r.number,

status:"Scheduled",

departure:{
airport:r.departure.airport,
scheduledTime:{local:r.departureTime}
},

arrival:{
airport:r.arrival.airport,
scheduledTime:{local:r.arrivalTime}
}

});

}

res.json(result);

});

app.get("/history",(req,res)=>{
res.json(loadHistory());
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log("Leni's Flight Tracker running");
console.log("Server running on port:",PORT);

});
