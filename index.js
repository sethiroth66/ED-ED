// custom settings
const demo_mode = true
const auto_open_browser = false

// system index to be stored in memory
let systems = {
  '__blank__': {
    system_name: '...',
    star_class: '?',
    scoopable: false,
    was_discovered: true,
    scan_progress: 0.00,
    body_count: 0,
    non_body_count: 0,
    main_body: 1,
    bodies: {}
  }
}

// template object for sending to browser
let EDJRData = {
  ship_status: {
    max_fuel: 0,
    fuel_level: 0,
    fuel_warn: false,
    fuel_critical: false,
    jumps_remaining: 0
  },
  currentSystem: systems['__blank__'],
  targetSystem: systems['__blank__'],
}

// package imports
let fs = require('fs')
let app = require('express')()
let http = require('http').createServer(app)
let io = require('socket.io')(http)
let os = require('os')
let es = require('event-stream')
let Tail = require('tail').Tail
const open = require('open')

let journals = [] // list journal files
let journal_index = 1
// Windows game home directory? (windows)
let path = os.userInfo().homedir + '/Saved Games/Frontier Developments/Elite Dangerous/'
let folder_exists = null
let _socket // the server socket connection

function process_log (log) {
  let system_name = ''
  let body_template = {
    // 'template_attr': 'LogAttribute'
    'star_system': 'StarSystem', // important one?
    'body_name': 'BodyName',
    'star_class': 'StarClass',
    'distance_from_arival': 'DistanceFromArrivalLS',
    'was_discovered': 'WasDiscovered',
    'was_mapped': 'WasMapped',
    // Start Stuff
    'star_type': 'StarType',
    'star_subclass': 'Subclass',
    'star_age': 'Age_MY',
    'star_mass': 'StellarMass',
    'star_radius': 'Radius',
    'star_temp_surface': 'SurfaceTemperature',
    // Planet/Moon Stuff
    'planet_class': 'PlanetClass',
    'planet_terraform': 'TerraformState',
    'planet_atmosphere': 'Atmosphere',
    'planet_atmosphere_type': 'AtmosphereType',
    'planet_volcanism': 'Volcanism',
    'planet_landable': 'Landable',
    'planet_radius': 'Radius',
    'planet_mass': 'MassEM',
    'planet_surface_temperature': 'SurfaceTemperature',
    'never_seen': false,
    // Demo note
    'demo_note': 'demo_note',
  }
  let scoopable_types = ['K', 'G', 'B', 'F', 'O', 'A', 'M',]
  let never_seen = ['X','Exotic','RoguePlanet','StellarRemnantNebula',]

  if (log.FuelLevel !== undefined) {
    EDJRData.ship_status.fuel_level = log.FuelLevel
    EDJRData.ship_status.fuel_warn = (EDJRData.ship_status.fuel_level < (EDJRData.ship_status.max_fuel / 2))
    EDJRData.ship_status.fuel_critical = (EDJRData.ship_status.fuel_level < (EDJRData.ship_status.max_fuel / 4))
  }

  if (log.event === 'Location') {
    if (systems[log.StarSystem] === undefined) {
      systems[log.StarSystem] = JSON.parse(JSON.stringify(systems['__blank__']))
      systems[log.StarSystem].system_name = log.StarSystem
    }
    system_name = systems[log.StarSystem].system_name
    EDJRData.currentSystem = systems[system_name]
    EDJRData.targetSystem = systems[system_name]

  }
  else if (log.event === 'Loadout') {
    EDJRData.ship_status.max_fuel = log.FuelCapacity.Main
  }
  else if (log.event === 'FSDTarget') {
    let name
    if (log.Name && log.Name.length) {
      name = log.Name
    }
    // forward thinking for if name gets changed to StarSystem. This is in documentation, but not used in logs...
    if (log.StarSystem && log.StarSystem.length) {
      name = log.StarSystem
    }
    if (log.RemainingJumpsInRoute !== undefined) {
      EDJRData.ship_status.jumps_remaining = log.RemainingJumpsInRoute
    }
    // For some reason this event uses "Name" instead of "StarSystem".
    if (systems[name] === undefined) {
      systems[name] = JSON.parse(JSON.stringify(systems['__blank__']))
      systems[name].system_name = name
      system_name = systems[name].system_name
    }
    else {
      system_name = name
    }

    EDJRData.targetSystem = systems[system_name]
  }
  else if (log.event === 'StartJump') {

    systems[log.StarSystem].system_name = log.StarSystem
    systems[log.StarSystem].star_class = log.StarClass
    systems[log.StarSystem].scoopable = scoopable_types.includes(systems[log.StarSystem].star_class)
    system_name = systems[log.StarSystem].system_name
    EDJRData.currentSystem = systems[system_name]

  }
  else if (log.event === 'FuelScoop') {
    EDJRData.ship_status.fuel_level = log.Total
    if (EDJRData.ship_status.fuel_warn || EDJRData.ship_status.fuel_critical) {
      EDJRData.ship_status.fuel_warn = (EDJRData.ship_status.fuel_level < (EDJRData.ship_status.max_fuel))
      EDJRData.ship_status.fuel_critical = (EDJRData.ship_status.fuel_level < (EDJRData.ship_status.max_fuel / 2))
    }
  }
  else if (log.event === 'FSDJump') {
    //main body
    systems[log.StarSystem].main_body = log.BodyID.toFixed(0)
    system_name = systems[log.StarSystem].system_name
    // EDJRData.targetSystem=systems['__blank__'];
    EDJRData.currentSystem = systems[system_name]
  }
  else if (log.event === 'Scan') { // primary planetary scan event
    if (systems[log.StarSystem] === undefined) {
      systems[log.StarSystem] = JSON.parse(JSON.stringify(systems['__blank__']))
      systems[log.StarSystem].system_name = log.StarSystem
      system_name = systems[log.StarSystem].system_name
    }
    let bodyId = log.BodyID.toFixed(0)
    if (systems[log.StarSystem].main_body !== undefined && bodyId === systems[log.StarSystem].main_body) {
      // this is the main star, consider some system details here
      systems[log.StarSystem].was_discovered = log.WasDiscovered
    }

    if (systems[log.StarSystem].bodies[bodyId] === undefined) {
      systems[log.StarSystem].bodies[bodyId] = {important: false}
    }

    // copy properties from the scan
    let body = systems[log.StarSystem].bodies[bodyId]
    for (let K in body_template) {
      let V = body_template[K]
      if (log[V] !== undefined) {
        body[K] = body[K] || log[V]
      }
    }

    // Not actual attribute, just used for notes when using demo mode.
    if (log.demo_note!==undefined){
      body.demo_note = log.demo_note;
    }

    // determine if the star type is scoopable
    if (body.star_type) {
      body.scoopable = scoopable_types.includes(body.star_type)
      body.never_seen = never_seen.includes(body.star_type);
    }

    // remove belt clusters
    body.belt_cluster = !!body.body_name.match(/BELT CLUSTER/i)

    // set planet_class 'class' :P
    body.planet_class_class = body.planet_class.toLowerCase().replace(/[^a-z]/g, '_')

    // guardian site?
    body.potential_guardian = false
    if (!!body.planet_class_class.match(/rock|metal/)) {
      if (body.planet_surface_temperature > 180 && body.planet_surface_temperature < 310) {
        if (body.planet_radius >= 999000 && body.planet_radius <= 3001000) {
          body.potential_guardian = true
        }
      }
    }
    if (!!body.body_name.match(/guardian/i)) {
      body.potential_guardian = true
    }

    // update progress
    let bodies_length = Object.keys(systems[log.StarSystem].bodies).length
    let full_body_count = systems[log.StarSystem].body_count + systems[log.StarSystem].non_body_count
    systems[log.StarSystem].scan_progress = full_body_count < bodies_length ? 0.3 : (bodies_length / full_body_count)

    system_name = systems[log.StarSystem].system_name
    EDJRData.currentSystem = systems[system_name]
  }
  else if (log.event === 'FSSDiscoveryScan') {
    systems[log.SystemName].scan_progress = log.Progress || systems[log.SystemName].scan_progress || 0
    systems[log.SystemName].body_count = log.BodyCount || systems[log.SystemName].body_count || 0
    systems[log.SystemName].non_body_count = log.NonBodyCount || systems[log.SystemName].non_body_count || 0
  }
  else if (log.event === 'FSSAllBodiesFound') {
    systems[log.SystemName].scan_progress = 1
  }
  else if (log.event === 'SAAScanComplete') {
    EDJRData.currentSystem.bodies[log.BodyID].was_mapped = 'scanned'
  }

  return system_name
}

function check_folder_exists () {

  try {
    fs.statSync(path)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('file or directory does not exist')
    }
  }

  return false
}

function get_latest_file () {

  if (!check_folder_exists()) {
    console.log('Cannot find folder -- Have you launched the game first?')
    process.exit(1)
    return false
  }

  let files_array = fs.readdirSync(path)
  let j = []
  for (let file of files_array) {
    if (file.match(/^journal\.\d+\.\d+\.log/i)) {
      j.push(file)
    }
  }
  journals = j.reverse()
  return journals[0].length ? path + journals[0] : false

}

// setup web application serve
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'))
app.get('/style.css', (req, res) => res.sendFile(__dirname + '/public/style.css'))
app.get('/vue.js', (req, res) => res.sendFile(__dirname + '/public/vue.js'))

http.listen(3000, function () {
  console.info('Serving silver platter to http://127.0.0.1:3000')
  if (auto_open_browser) {
    (async () => await open('http://127.0.0.1:3000'))()
  }
})

io.on('connection', function (socket) {
  _socket = socket
  console.log('a user connected')
  _socket.emit('message', {'action': 'update', 'EDJRData': EDJRData})
  _socket.on('disconnect', function () {
    console.log('user disconnected')
  })
})

function new_tail_watcher () {
  let file_path = ''
  if (demo_mode) {
    file_path = './examples/demo_log.log'
  }
  else {
    get_latest_file()
    if (journals[journal_index] === undefined) {
      journal_index -= 1
    }
    file_path = path + journals[journal_index]
  }
  if (file_path && file_path.length) {
    console.info(file_path)
    let tail_options = {fromBeginning: true, follow: true, useWatchFile: true, flushAtEOF: true}
    tail = new Tail(file_path, tail_options)
    tail.on('error', function (data) {
      console.error('error tailing or something')
      console.log(data)
    })
    tail.on('line', function (line) {
      new Promise(function (resolve, reject) {
        if (line.length > 0) {
          let json_data = JSON.parse(line)
          let event = json_data.event
          if (event === 'Music') {
            reject()
            return
          }
          // console.log(event);
          let name = process_log(json_data)
          if (event === 'Continue') {
            console.log('switching file?!')
            tail.unwatch()
            setTimeout(function () {
              new_tail_watcher()
              reject()
            }, 5000)
          }
          if (event === 'Shutdown') {
            tail.unwatch()
            if (journal_index >= 1) {
              journal_index -= 1
              new_tail_watcher()
              reject()
            }
            else {
              reject('folder_watch')
            }
          }
          if (name.length > 0) {
            // console.log(json_data);
            resolve()
          }
          else {
            resolve()
          }
        }
      }).then(function (data) {
        if (journal_index === 0) {
          _socket.emit('message', {'action': 'update', 'EDJRData': EDJRData})
        }
      }).catch(function (data) {
        if (data === 'folder_watch') {
          console.log('starting folder watch?')
          fs.watch(path, (eventType, filename) => {
            if (eventType === 'rename') {
              console.log('detected \'rename\'?')
              new_tail_watcher()
            }
          })
        }
      })

    })
  }
  else {
    console.log('something went wrong finding file to watch')
    setTimeout(function () {
      new_tail_watcher()
    }, 2000)
  }
}

new_tail_watcher()

