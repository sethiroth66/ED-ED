// dont mind me... just pissing about.. 

let EDJR = require("./EDJR");
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

// setup web application serve
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/style.css', (req, res) => res.sendFile(__dirname + '/public/style.css'));
// serve the web application
http.listen(3000, () => console.info('Serving silver platter to http://127.0.0.1:3000'));

io.on('connection', function(socket){
  console.log('a user connected');
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
let ED = new EDJR();

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
