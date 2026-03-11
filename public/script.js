const map = L.map("map").setView([25,40],3);

L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",{
maxZoom:20
}).addTo(map);

let markers=[];

function clearMarkers(){
markers.forEach(m=>map.removeLayer(m));
markers=[];
}

function createPlaneIcon(flight){

return L.divIcon({
className:"",
html:`

<div style="text-align:center">
<div style="
background:black;
color:white;
padding:3px 8px;
border-radius:4px;
font-size:13px;
margin-bottom:4px;
display:inline-block;">
${flight}
</div>
<div style="color:red;font-size:34px;">✈</div>
</div>
`,
iconSize:[60,60],
iconAnchor:[30,30]
});

}

async function updateFlights(){

try{

const res = await fetch(
"https://corsproxy.io/?https://opensky-network.org/api/states/all"
);

const data = await res.json();

clearMarkers();

let trackedFlights = ["UAE28","UAE376","UAE375","UAE27"];

data.states.forEach(state=>{

let callsign = state[1] ? state[1].trim() : "";

if(!trackedFlights.includes(callsign)) return;

let lat = state[6];
let lon = state[5];

if(!lat || !lon) return;

let marker = L.marker(
[lat,lon],
{icon:createPlaneIcon(callsign.replace("UAE","EK"))}
).addTo(map);

markers.push(marker);

});

}catch(e){

console.log("Flight data error");

}

}

updateFlights();

setInterval(updateFlights,10000);
