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
    system_allegiance: '',
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
    jumps_remaining: 0,
    current_distance_jumped: 0,
    game_start: null,
    avg_ly_per_hour: null
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
    '_was_mapped': 'WasMapped',
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

  if (log.event === 'LoadGame') {
    // new game, reset some stuff for current session?
    EDJRData.ship_status.current_distance_jumped = 0
    EDJRData.ship_status.game_start = (new Date(log.timestamp)).getTime()/1000;

  }
  else if (log.event === 'Location') {
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

    EDJRData.ship_status.current_distance_jumped += Number(log.JumpDist)

    let curtime = (new Date()).getTime()/1000;
    let time_seconds = (curtime - EDJRData.ship_status.game_start)
    let time_hours = time_seconds / 60 / 60
    let speed = EDJRData.ship_status.current_distance_jumped / time_hours
    // let speed_hours = (speed / 60) / 60;
    EDJRData.ship_status.avg_ly_per_hour = speed

    //main body
    systems[log.StarSystem].system_allegiance = log.SystemAllegiance;

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

    let credits = estimate_planet_credits(system_name,bodyId);
    if(credits>0){
      body.estimated_credits = credits;
      body.potential_credits = estimate_planet_credits(system_name,bodyId,true);
    }

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
    let bodyId = log.BodyID.toFixed(0)
    system_name = EDJRData.currentSystem.system_name

    EDJRData.currentSystem.bodies[bodyId].was_mapped = 'scanned'
    EDJRData.currentSystem.bodies[bodyId].efficiency_target = log.EfficiencyTarget
    EDJRData.currentSystem.bodies[bodyId].probes_used = log.ProbesUsed
    EDJRData.currentSystem.bodies[bodyId].met_efficiency = (log.ProbesUsed<=log.EfficiencyTarget)

    let credits = estimate_planet_credits(system_name,bodyId);
    if(credits>0){
      EDJRData.currentSystem.bodies[bodyId].estimated_credits = credits;
      EDJRData.currentSystem.bodies[bodyId].potential_credits = estimate_planet_credits(system_name,bodyId,true);
    }
  }


  return system_name
}

//q seems to be a constant. It, too, probably needs tweaking - and I can't help but feel I'm missing it's significance - but it's approximately: 0.56591828
const q = 0.56591828;
const kstars = {
  "Star":1200,
  "NS/BH":22628,
  "WD":14057
}
const kbodies = {
  'Metal rich body': 21790,
  'Ammonia world': 96932,
  'Sudarsky class I gas giant': 1656,
  'Sudarsky class II gas giant': 9654,
  'High metal content body': 9654,
  'Water world': 64831,
  'Earthlike body': 64831,
  'other': 300,
}
const kbodiesTerraformable = {
  'Metal rich body': kbodies['Metal rich body'],
  'Ammonia world': kbodies['Ammonia world'],
  'Sudarsky class I gas giant': kbodies['Sudarsky class I gas giant'],
  'Sudarsky class II gas giant': 100677,
  'High metal content body': 100677,
  'Water world': 116295,
  'Earthlike body': 116295,
  'other': 93328,
}
/** @todo figure out how to calculate star and total system credit. */
function estimate_star_credits (system_name, body_id, get_max_potential = false) {

  let body = systems[system_name].bodies[body_id]

  let k = kstar.Star
  let mass = Number(body.star_mass)

  // Since 3.3, payouts have been tweaked. For stars, broadly speaking, the basic calculation remains:

  let value = (k + (mass * k / 66.25))

  // Where k is:
  // Star   k
  // Star	  1200
  // NS/BH  22628
  // WD	    14057

  // The main star also gets a bonus for honking based of the value of all the other bodies in the system. For planetary bodies, it seems to be (applied per-body):
  // Code:
  let  honk_bonus_value = Math.max(500,(k + k * q * Math.pow(mass,0.2)) / 3 );
  honk_bonus_value *= (body.was_discovered) ? 1 : 2.6;
  // For stellar bodies, it's a straight 1/3rd base value (with 2.6 multiplier if an undiscovered system, same as planetary bodies).

}
function estimate_planet_credits (system_name, body_id, get_max_potential = false) {

  let body = systems[system_name].bodies[body_id]

  if (!(body.planet_class !== undefined && body.planet_class !== null && body.planet_class.length)) {
    return
  }

  let planet_k = kbodies.other
  if (body.planet_terraform !== '') {
    if (kbodiesTerraformable[body.planet_class] !== undefined) {
      planet_k = kbodiesTerraformable[body.planet_class]
    }
    else {
      planet_k = kbodiesTerraformable.other
    }
  }
  else {
    if (kbodies[body.planet_class] !== undefined) {
      planet_k = kbodies[body.planet_class]
    }
  }



  let isFirstDicoverer = !body.was_discovered
  let isMapped = !body._was_mapped
  let isFirstMapped = !isMapped && (body.probes_used !== undefined && body.probes_used > 0)
  let met_scan_efficiency = body.met_efficiency;

  if (get_max_potential===true){
    if (isMapped){
      met_scan_efficiency=true;
    }
  }

  let mappingMultiplier = 1
  if (isMapped) {
    if (isFirstDicoverer && isFirstMapped) {
      mappingMultiplier = 3.699622554
    }
    else if (isFirstMapped) {
      mappingMultiplier = 8.0956
    }
    else {
      mappingMultiplier = 3.3333333333
    }
    mappingMultiplier *= (met_scan_efficiency) ? 1.25 : 1
  }
  let pbs = planet_k + (planet_k * Math.pow(body.planet_mass, 0.2) * q)
  let value = Math.max(500, (pbs) * mappingMultiplier)
  value *= (isFirstDicoverer) ? 2.6 : 1
  value = Math.round(value)
  return value

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

