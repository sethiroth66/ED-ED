// dont mind me... just pissing about.. 

// systems found in this session
let systems = {
  "__blank__": {
    system_name: "...",
    star_class: "?",
    scoopable: false,
    was_discovered: true,
    scan_progress: 1,
    main_body: 1,
    bodies: []
  }
};

let EDJRData = {
  currentSystem : systems['__blank__'],
  targetSystem : systems['__blank__'],
}

function process_log(log){
  let system_name ="";
  let body_template = {
    "star_system": "StarSystem", // important one?
    "system_name": "BodyName",
    "star_class": "StarClass",
    "distance_from_arival": "DistanceFromArrivalLS",
    "was_discovered": "WasDiscovered",
    "was_mapped": "WasMapped",
    // Start Stuff
    "star_type": "StarType",
    "star_subclass": "Subclass",
    "star_age": "Age_MY",
    // Planet/Moon Stuff
    "planet_class": "PlanetClass",
    "planet_terraform": "TerraformState",
    "planet_atmosphere": "Atmosphere",
    "planet_atmosphere_type": "AtmosphereType",
    "planet_volcanism": "Volcanism",
    "planet_landable": "Landable"
  };
  let scoopable_types = ["K","G","B","F","O","A","M",];
  if (log.event==="Location"){
    if (!systems[log.StarSystem].length){
      systems[log.StarSystem].system_name = systems[log.StarSystem].system_name || log.StarSystem;
      system_name = systems[log.StarSystem].system_name;
    }
    EDJRData.targetSystem = systems[log.Name];
  }else if (log.event==="FSDTarget"){
    if (!systems[log.Name].length){
      systems[log.Name].system_name = systems[log.Name].system_name || log.Name;
      system_name = systems[log.Name].system_name;
    }
    EDJRData.targetSystem = systems[log.Name];
  }else if(log.event === "StartJump"){
    systems[log.StarSystem].system_name = systems[log.StarSystem].system_name || log.StarSystem;
    systems[log.StarSystem].start_class = systems[log.StarSystem].star_class || log.StarClass;
    systems[log.StarSystem].scoopable = scoopable_types.includes(systems[log.StarSystem].star_class);
    system_name = systems[log.StarSystem].system_name;
    
  }else if(log.event === "FSDJump"){
    //main body
    systems[log.StarSystem].main_body = log.BodyID;
    system_name = systems[log.StarSystem].system_name;
    EDJRData.targetSystem=systems['__blank__'];
    EDJRData.currentSystem=systems[system_name];
  }else if(log.event === "Scan"){
    if (log.BodyID === systems[log.StarSystem].main_body) {
      // this is the main star, consider some system details here
      systems[log.StarSystem].was_discovered = systems[log.StarSystem].was_discovered || log.WasDiscovered;
    }
    
    let bodyId = systems[log.StarSystem].BodyID;
    for (let K in body_template) {
      let V = body_template[K];
      if (systems[log.StarSystem].bodies[bodyId] === undefined){
        systems[log.StarSystem].bodies[bodyId] = {};
      }
      systems[log.StarSystem].bodies[bodyId][K] = systems[log.StarSystem].bodies[bodyId][K] || log[V] 
    }
    system_name = systems[log.StarSystem].system_name;
    EDJRData.currentSystem=systems[system_name];
  }
  
  return system_name;
}

let fs = require("fs");
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

// setup web application serve
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/style.css', (req, res) => res.sendFile(__dirname + '/public/style.css'));
app.get('/vue.js', (req, res) => res.sendFile(__dirname + '/public/vue.js'));

http.listen(3000, () => console.info('Serving silver platter to http://127.0.0.1:3000'));

let _socket;
io.on('connection', function(socket){
  _socket = socket;
  console.log('a user connected');
  _socket.emit("message", {"action": "update", "EDJRData":EDJRData});
  _socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
function sendUpdate(){
  if(_socket.emit("message", {"action": "update", "EDJRData":EDJRData})){
    return true;
  }else{
    return false;
  }
}
function sendUpdateCurrent(){
  _socket.emit("message", {"action": "updateCurrent", "EDJRData":EDJRData.currentSystem});
}
function sendUpdateTarget(){
  _socket.emit("message", {"action": "updateTarget", "EDJRData":EDJRData.currentSystem});
}

// return;

let es = require("event-stream");
let Tail = require('tail').Tail;

// let tmpfile_path = "./examples/Journal.190921175417.01.log";
let tmpfile_path = "./examples/test_tail.log";

// let tail_options = {follow: true,useWatchFile: true,flushAtEOF: true};
// tail = new Tail(tmpfile_path,tail_options);
// tail.on("error", data => console.error(data));
// tail.on("line", data => console.log(data));

// fs.copyFile(file_path, tmpfile_path, function(data){console.log(data)});
// @todo FIX FOR SOME REASON SKIPPING ALL THE EVENTS I NEED?!
let line_number = 1;
var s = fs.createReadStream(tmpfile_path)
  .pipe(es.split())
  .pipe(es.mapSync(function (line) {
      new Promise((resolve, reject) => {
        s.pause()
        if (line.length > 0) {
          let json_data = JSON.parse(line);
          let event = json_data.event;
          let name = process_log(json_data);
          let has_length = name.length;
          if (process_log(json_data).length > 0) {
            if (sendUpdate()) {
              console.log("sending update");
              resolve()
              return;
            }else{
              reject({"code": 3, "message":"send update failed?"});
              return;
            }
          } else {
            reject({"code": 1, "message": "Not listening for this event?"})
            return;
          }
        }else{
          reject({"code": 2, "message": "empty line"})
          return;
        }
      }).then((data) => {
        s.resume();
        return
      }).catch((reason) => {
        if (reason.code === 1 || reason.code === 2) {
          // console.warn(reason);
        } else {
          console.error("Something went wrong...")
        }
        s.resume();
        return
      });

      line_number = line_number + 1;
    })
      .on('error', function (err) {
        console.log('Error while reading file.', err);
      })
      .on('end', function () {
        console.log('Read entire file.')
        console.log(systems)
      })
  );
