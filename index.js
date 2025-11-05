import express from "express";
const port = process.env.PORT || 3000;
const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));



app.get("/",(req,res)=>{
   res.render("citizzen");
});

var report = 1101;

const WasteComplaints =[];
const PotholeComplaints =[];
const ElectricityComplaints =[];
const WardComplaints =[];
const miscellaneous =[];

function classifyComplaint(description) {
  const text = description.toLowerCase(); // make case-insensitive

  // Keywords for each category
  const electricityKeywords = [
  "light", "electric", "electricity", "power", "current", "voltage", "transformer", "wire", 
  "fuse", "socket", "switch", "short circuit", "spark", "shock", "meter", "energy", "load", 
  "grid", "connection", "phase", "trip", "tripping", "supply", "outage", "cut", "blackout", 
  "brownout", "burning smell", "flicker", "flickering", "bulb", "tube light", "streetlight", 
  "street light", "lamp", "generator", "backup", "inverter", "breaker", "main line", 
  "distribution", "line fault", "transformer blast", "load shedding", "loadshedding", 
  "surge", "low voltage", "high voltage", "no current", "electric pole", "pole", "wire break", 
  "damaged wire", "open wire", "electric shock", "electrocution", "feeder", "feeder fault", 
  "meter reading", "fault", "fuse blown", "power fluctuation", "fluctuation", "voltage drop", 
  "no power", "no electricity", "power cut", "power down", "connection issue", 
  "meter not working", "transformer oil", "transformer leak", "transformer fire", 
  "underground cable", "cable fault", "electric board", "EB", "line problem", "phase issue", 
  "shorted wire", "power supply", "current issue", "line cut", "power tripped", "main fuse", 
  "main switch", "switchboard", "distribution box", "electric line", "energy meter", 
  "streetlight not working", "transformer problem", "overload", "overheating", 
  "neutral line", "earthing", "no lights", "low light", "electric failure", 
  "power failure", "electrical fault", "line disconnected", "billing meter", 
  "service wire", "power restoration", "electric problem"
];

  const potholeKeywords = [
  "pothole", "road", "hole", "crack", "damaged", "broken road", "uneven road", 
  "bumpy road", "road damage", "road repair", "road maintenance", "open pit", 
  "pit", "ditch", "crater", "road crack", "road erosion", "rough road", 
  "road surface", "damaged surface", "sunken road", "broken patch", "road patch", 
  "road hole", "open manhole", "manhole", "manhole cover", "missing cover", 
  "collapsed road", "caved road", "road cave-in", "eroded road", "paved road", 
  "unpaved road", "damaged bridge", "road break", "road cut", "broken lane", 
  "lane crack", "damaged lane", "roadwork", "construction debris", 
  "bad road", "road not repaired", "rough patch", "road condition", 
  "damaged footpath", "sidewalk damage", "footpath crack", "road depression", 
  "road subsidence", "road dent", "sunken patch", "broken concrete", 
  "cement patch", "tar road", "bitumen", "asphalt", "asphalt crack", 
  "tarmac", "road blockage", "mud road", "dusty road", "uneven surface", 
  "road filled with water", "waterlogging", "flooded road", "rain damage", 
  "washed out road", "pavement", "damaged pavement", "road tiles", "broken tiles", 
  "drain on road", "open drain", "road corner damage", "speed breaker issue", 
  "speed bump", "road hump", "bad patch", "loose gravel", "stones on road", 
  "roadside damage", "road sign missing", "no marking", "faded marking", 
  "broken divider", "damaged divider", "road divider", "road median", 
  "damaged railing", "broken barrier", "barricade", "road dug", "dug up", 
  "road excavation", "road blocked", "under repair", "construction on road", 
  "road hazard", "dangerous road", "unsafe road", "road collapse", 
  "uneven surface", "bumpy stretch", "bad pavement", "road repair pending"
];

  const wasteKeywords = [
  "garbage", "waste", "trash", "dustbin", "dump", "litter", "refuse", "rubbish",
  "filth", "unclean", "dirty", "uncleared", "waste bin", "garbage bin",
  "overflowing bin", "open bin", "public bin", "dust bin", "wastebasket",
  "garbage truck", "dump yard", "dumping ground", "open dump", "landfill",
  "solid waste", "wet waste", "dry waste", "household waste", "bio waste",
  "medical waste", "plastic waste", "plastic bag", "polythene", "non biodegradable",
  "garbage collection", "waste collection", "trash pickup", "missed collection",
  "garbage not collected", "uncollected garbage", "overflowing garbage",
  "piled up garbage", "heap of waste", "garbage pile", "roadside dump",
  "waste lying", "dirty street", "dirty road", "garbage smell", "bad smell",
  "foul smell", "odor", "stink", "drain clog", "blocked drain", "open drain",
  "open sewer", "clogged sewer", "drainage issue", "sewage", "sewage overflow",
  "sanitation", "poor sanitation", "cleanliness", "unclean area", "dirty spot",
  "municipal waste", "trash can", "dumping issue", "illegal dumping", "fly-tipping",
  "garbage fire", "burning waste", "burnt garbage", "waste bin missing",
  "no dustbin", "dustbin missing", "garbage collection delay", "not cleaned",
  "not picked up", "garbage scattered", "animals on garbage", "stray dogs garbage",
  "street not cleaned", "area not cleaned", "unclean locality", "trash everywhere",
  "overflowing drain", "sewer overflow", "clogged pipe", "sanitary waste",
  "toilet waste", "public toilet dirty", "urinal dirty", "waste spillage",
  "spilled garbage", "municipality not cleaning", "sweeper absent",
  "waste collection not done", "garbage service issue", "trash dumping",
  "unclean garbage area", "dirty garbage spot", "overflowing trash bin",
  "street cleanliness issue", "garbage complaint"
];


  // Check Electricity
  if (electricityKeywords.some(word => text.includes(word))) {
    return "Electricity";
  }

  // Check Pothole
  if (potholeKeywords.some(word => text.includes(word))) {
    return "Pothole";
  }

  // Check Waste
  if (wasteKeywords.some(word => text.includes(word))) {
    return "Waste";
  }

  // Default case if no keywords matched
  return "Other";
}

async function getAddress(lat, lng) {
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=0de728ac874a466db7b2989082bf6ab3`;

  const res = await fetch(url);
  const data = await res.json();
  

  // assuming your API response is stored in a variable called 'data'
const name = data.features[0].properties.name;
const city = data.features[0].properties.city;
const postcode = data.features[0].properties.postcode;

// Combine into a readable string
const address = `${name}, ${city}, ${postcode}`;
return address;
;
}



app.post("/submit", async(req, res) => {
   try{
  // Access description directly
  const description = req.body.description;
  const phone = req.body.reporterPhone;
  const location = req.body.location;
  const lat = req.body.latitude;
  const lon = req.body.longitude;
  let area ="";
if (!lat || !lon) {
  area = "Unknown";
} else {
  try {
    area = await getAddress(lat, lon);
  } catch (err) {
    console.error(err);
    area = "Unknown";
  }
}
  let dept = "";
  let compNum = 0; 
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });


   var category = classifyComplaint(description);
   
   if(category=="Pothole"){
      const NewComplaint ={
         id: PotholeComplaints.length +1,
         description,
         phone,
         category:"Pothole Issue",
         submissionDate:formattedDate,
         location,
         area,
         lat,
         lon,
         status:'pending'
      }
      dept = "PO";
      compNum = PotholeComplaints.length +1;
      PotholeComplaints.push(NewComplaint);
      // do something
   }else if(category=="Electricity"){
      const NewComplaint ={
         id: ElectricityComplaints.length +1,
         description,
         phone,
         category:"Electricity Issue",
         location,
         submissionDate:formattedDate,
         area,
         lat,
         lon,
         status:'pending'
      }
      dept = "EL";
      compNum = ElectricityComplaints.length +1;
      ElectricityComplaints.push(NewComplaint);
      // something
   }else if(category=="Waste"){
      const NewComplaint ={
         id: WasteComplaints.length +1,
         description,
         phone,
         category:"Garbage Issue",
         location,
         submissionDate:formattedDate,
         area,
         lat,
         lon,
         status:'pending'
      }
      dept = "SW";
      compNum = WasteComplaints.length +1;
      WasteComplaints.push(NewComplaint);
      // something
   }else{
    const NewComplaint ={
         id: miscellaneous.length +1,
         description,
         phone,
         category:"Unidentified Issue",
         location,
         submissionDate:formattedDate,
         area,
         lat,
         lon,
         status:'pending'
      }
      dept = "FL";
      compNum = miscellaneous.length +1;
      miscellaneous.push(NewComplaint);
   }
   let compID = `${dept}-2025-0${compNum}`;
  res.render("complaint",{
   complaintID:compID
  });
}catch(err) {
    // If any unexpected error happens
    console.error("Submit route error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/track-status",(req,res)=>{
   res.render("track");
});

app.get("/waste",(req,res)=>{
   res.render("solidWaste", {
      complaints:WasteComplaints
   });
});

app.get("/ward",(req,res)=>{
   res.render("ward");
});

app.get("/electricity",(req,res)=>{
   res.render("electricity",{
      complaints:ElectricityComplaints
   });
});


app.get("/pothole",(req,res)=>{
   res.render("pothole",{
      complaints:PotholeComplaints
   });
});
app.get("/fallback",(req,res)=>{
  res.render("miscellaneous",{
    complaints:miscellaneous
  })
});


app.get("/track/:id", async (req, res) => {
    let idx = req.params.id;
    let dept = idx.slice(0, 2);
    idx = Number(idx.substring(9));
    let complaintstatus;

    if(dept == "EL"){
      complaintstatus = ElectricityComplaints[idx-1];
    }else if(dept == "PO"){
      complaintstatus = PotholeComplaints[idx-1];
    }else if(dept == "SW"){
      complaintstatus = WasteComplaints[idx-1];
    }else{
      complaintstatus = miscellaneous[idx-1];
    }

    res.render("track", { complaintstatus, deptt:dept });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 