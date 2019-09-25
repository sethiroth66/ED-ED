// dont mind me... just pissing about.. 

var system_name = 'Taurus Dark Region EB-X b1-2';
let fsdjump = {
  "timestamp": "2019-09-19T18:19:00Z",
  "event": "FSDJump",
  "StarSystem": "Trianguli Sector BA-A d69",
  "SystemAddress": 2381316082011,
  "StarPos": [62.71875, -57.59375, -126.12500],
  "SystemAllegiance": "",
  "SystemEconomy": "$economy_None;",
  "SystemEconomy_Localised": "None",
  "SystemSecondEconomy": "$economy_None;",
  "SystemSecondEconomy_Localised": "None",
  "SystemGovernment": "$government_None;",
  "SystemGovernment_Localised": "None",
  "SystemSecurity": "$GAlAXY_MAP_INFO_state_anarchy;",
  "SystemSecurity_Localised": "Anarchy",
  "Population": 0,
  "Body": "Trianguli Sector BA-A d69 A",
  "BodyID": 1,
  "BodyType": "Star",
  "JumpDist": 26.837,
  "FuelUsed": 3.923211,
  "FuelLevel": 17.768406
};

let EDJR = require("./EDJR");
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
// let ed = new EDJR;
// let ed = EDJR.EDJR;
// ed().FSDJump(fsdjump);

// setup web application serve
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/style.css', (req, res) => res.sendFile(__dirname + '/public/style.css'));
app.get('/vue.js', (req, res) => res.sendFile(__dirname + '/public/vue.js'));

// serve the web application

let EDJRData = {
  currentSystem : {
    name: "Taurus Dark Region EB-X b1-2",
    star_class: "K",
    was_discovered: true,
    scan_progress: 0.123
  },
  targetSystem : {
    system: {
      name: "Taurus Dark Region EB-X b1-3",
      star_class: "O"
    }
  },
  bodies : {
    bodies:[
      {name: "Taurus Dark Region EB-X b1-2 A 3 A",was_discovered:false,was_mapped:false},
      {name: "Taurus Dark Region EB-X b1-2 A 3 B",was_discovered:false,was_mapped:false},
      {name: "Taurus Dark Region EB-X b1-2 A 3 C",was_discovered:false,was_mapped:false},
      {name: "Taurus Dark Region EB-X b1-2 A 3 D",was_discovered:false,was_mapped:false},
      {name: "Taurus Dark Region EB-X b1-2 A 3 E",was_discovered:false,was_mapped:false},
      {name: "Taurus Dark Region EB-X b1-2 A 3 F",was_discovered:false,was_mapped:false},
    ]
  },

}

http.listen(3000, () => console.info('Serving silver platter to http://127.0.0.1:3000'));
io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit("message", {"action": "update", EDJRData});
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

return;

let es = require("event-stream");
let Tail = require('tail').Tail;

let file_path = "./examples/Journal.190921175417.01.log";
let tmpfile_path = "./examples/test_tail.log";

// let tail_options = {follow: true,useWatchFile: true,flushAtEOF: true};
// tail = new Tail(tmpfile_path,tail_options);
// tail.on("error", data => console.error(data));
// tail.on("line", data => console.log(data));
// let ED = new EDJR();

// fs.copyFile(file_path, tmpfile_path, function(data){console.log(data)});
var s = fs.createReadStream(tmpfile_path)
  .pipe(es.split())
  .pipe(es.mapSync(function(line){
    let json_data;
    let myFirstPromise = new Promise((resolve, reject) => {
      s.pause()
      if (line.length){
        json_data = JSON.parse(line);
        if (ED.addEvent(json_data)){
          setTimeout(() => resolve(json_data), 10);
        }else{
          reject("Not listening for this event")
        }
      }
      reject()
    });
    myFirstPromise.then((json_data) => {
      if (json_data instanceof Object){
        console.log(json_data);
      }
      s.resume();
    });
      // s.pause(); // pause the readstream
      // console.log(line);
      // s.resume(); // resume the readstream, possibly from a callback
    })
      .on('error', function(err){
        console.log('Error while reading file.', err);
      })
      .on('end', function(){
        console.log('Read entire file.')
      })
  );

console.log(EDJR);
