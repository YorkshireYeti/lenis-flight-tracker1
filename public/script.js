const map = L.map("map").setView([30,20],3);

L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",{
maxZoom:20
}).addTo(map);

let markers=[];

function clearMarkers(){
markers.forEach(m=>map.removeLayer(m));
markers=[];
}

function formatTime(t){

if(!t) return "Unknown";

let d=new Date(t);

return d.toLocaleString("en-GB",{
day:"numeric",
month:"short",
hour:"2-digit",
minute:"2-digit"
});

}

function calculateBearing(lat1,lon1,lat2,lon2){

const toRad=d=>d*Math.PI/180;
const toDeg=r=>r*180/Math.PI;

let y=Math.sin(toRad(lon2-lon1))*Math.cos(toRad(lat2));
let x=Math.cos(toRad(lat1))*Math.sin(toRad(lat2))-
Math.sin(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(toRad(lon2-lon1));

let brng=toDeg(Math.atan2(y,x));

return(brng+360)%360;

}

function createPlaneIcon(flightNumber,angle){

return L.divIcon({
className:"",
html:`

<div style="text-align:center">
<div style="
background:#111;
color:white;
padding:4px 10px;
border-radius:4px;
font-size:14px;
margin-bottom:4px;
display:inline-block;">
${flightNumber}
</div>
<div style="
color:red;
font-size:36px;
transform:rotate(${angle}deg);
">
✈
</div>
</div>
`,
iconSize:[70,70],
iconAnchor:[35,35]
});

}

function calculateProgress(depTime,arrTime){

if(!depTime||!arrTime) return 0;

let now=Date.now();
let dep=new Date(depTime).getTime();
let arr=new Date(arrTime).getTime();

if(now<=dep) return 0;
if(now>=arr) return 100;

return Math.round(((now-dep)/(arr-dep))*100);

}

async function updateFlights(){

const res=await fetch("/api/flights");
const flights=await res.json();

clearMarkers();

let html="";

flights.forEach(f=>{

let depAirport=f.departure.airport.name;
let arrAirport=f.arrival.airport.name;

let depLat=f.departure.airport.location.lat;
let depLon=f.departure.airport.location.lon;

let arrLat=f.arrival.airport.location.lat;
let arrLon=f.arrival.airport.location.lon;

let depTime=f.departure.scheduledTime.local;
let arrTime=f.arrival.scheduledTime.local;

let status=f.status;

let progress=calculateProgress(depTime,arrTime);

html+=
"<div class='flightCard'>"+
"<b>"+f.number+"</b><br>"+
depAirport+" → "+arrAirport+
"<br><br>"+
"<b>Departure:</b> "+formatTime(depTime)+"<br>"+
"<b>Arrival:</b> "+formatTime(arrTime)+"<br>"+
"<b>Status:</b> "+status+"<br>"+
"<b>Journey:</b> "+progress+"%"+
"</div>";

let lat=depLat+(arrLat-depLat)*(progress/100);
let lon=depLon+(arrLon-depLon)*(progress/100);

let bearing=calculateBearing(depLat,depLon,arrLat,arrLon);

let marker=L.marker(
[lat,lon],
{icon:createPlaneIcon(f.number,bearing)}
).addTo(map);

markers.push(marker);

});

document.getElementById("flights").innerHTML=html;

}

async function loadJourneyLog(){

const res=await fetch("/journeylog");
const data=await res.json();

let html="";

data.slice().reverse().forEach(j=>{
html+=j.date+" — "+j.flight+" — "+j.status+"<br>";
});

document.getElementById("journeylog").innerHTML=html;

}

async function loadDashboard(){

const res = await fetch("/stats");
const data = await res.json();

let html =
"<div style='text-align:center;font-size:18px'>"+
"<b>Total Flights:</b> "+data.total+"<br>"+
"<b>Completed:</b> "+data.completed+"<br>"+
"<b>Cancelled:</b> "+data.cancelled+"<br>"+
"<b>Success Rate:</b> "+data.success+"%"+
"</div>";

document.getElementById("dashboard").innerHTML = html;

}

updateFlights();
loadJourneyLog();
loadDashboard();

setInterval(updateFlights,5000);
setInterval(loadJourneyLog,60000);
setInterval(loadDashboard,60000);
