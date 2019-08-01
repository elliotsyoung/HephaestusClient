const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const app_keys = require('./keys');
const path = require('path')
const url = require('url')
const fs = require('fs');
const {
  ipcMain
} = require('electron')


var socket = require('socket.io-client')('https://fusionpaloalto.elliotsyoung.com');

socket.emit("subscribe", {
  room: "sam almaer"
});

socket.on("change voice", (new_voice) => {
  console.log("Request to change voice");
  mainWindow.webContents.send("change voice", new_voice);
})

socket.on('rotate head', (angle) => {
  console.log("recieved socket request to rotate head " + angle + " degrees");
  rotate_head(angle);
});

socket.on('robot speak command', (msg) => {
  console.log("robot speak command received");
  mainWindow.webContents.send("robot speak command", msg);
});

let PiCamera;
let myCamera;

if (process.env.ENV != "DEV") {
  PiCamera = require('pi-camera');
  myCamera = new PiCamera({
    mode: 'photo',
    output: `${ __dirname }/pictures/capture.jpg`,
    width: 640,
    height: 480,
    nopreview: true,
    vflip: true
  });
}

var Kairos = require('kairos-api');
var client = new Kairos(app_keys.kairos_app_id, app_keys.kairos_app_key);


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    // protocol: 'https:',
    // pathname: 'soundcloud.com/couldever/maybe',
    slashes: true
  }))

  mainWindow.maximize();
  mainWindow.setMenu(null);

  // mainWindow.maximize();
  // mainWindow.setFullScreen(true);

  // setTimeout(()=>{
  //   mainWindow.focus();
  //   mainWindow.setFullScreen(false);
  // }, 3000)
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  // Emitted when the window is closed.
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    console.log("Goodbye.");
    app.quit()
  }

})

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('focus', (event, arg) => {
  // rotate_head(Math.floor(Math.random() * 170));
  // mainWindow.focus();
})

ipcMain.on('detect face', (event, arg) => {
  if (process.env.ENV != "DEV") {
    console.log("not in dev mode");
    detect_face()
  }
  socket.emit("robot speak command", "Hello there!");
})


function rotate_head(angle) {
  console.log("Rotating head:", angle);
  if (process.env.ENV != "DEV") {
    let PythonShell = require('python-shell');
    var options = {
      args: ['1', `${angle}`]
    };
    PythonShell.run("servo_controller.py", options, (err, logs) => {
      if (err) {
        console.log(err);
      }
      console.log("Ended servo process, logs below:");
      console.log(logs);
      PythonShell = null;
    });

  }
}

const facing_teacher_angle = 40;
const facing_student_angle = 140;

function detect_face() {
  // this program is also tested on a mac locally before deploying to the rapsberry pi
  if (process.env.ENV != "DEV") {
    rotate_head(facing_student_angle)
  }

  myCamera.snap()
    .then((result) => {
      const file = fs.readFileSync('./pictures/capture.jpg', 'base64');
      var params = {
        image: file,
      };
      client.detect(params)
        .then(function(result) {
          console.log("RESULT OF FACIAL RECOGNITION");
          if (result.body.images && result.body.images[0].faces) {
            console.log("Detected a face!");
            recognize_face()
          } else {
            console.log("No face detected.");
            rotate_head(facing_teacher_angle)
            socket.emit("robot speak command", "I cannot see anybody. Tell them to stand in front of the camera.");
          }
        })
        .catch(function(err) {
          console.log(err);
        });

    })
}

function recognize_face() {
  const file = fs.readFileSync('./pictures/capture.jpg', 'base64');

  var params = {
    image: file,
    gallery_name: "elliot_faces"
  };

  client.recognize(params)
    .then(function(result) {

      if (result.body.images[0].candidates) {
        const recognized_individual = result.body.images[0].candidates[0].subject_id;
        const percent_confidence = Math.floor(result.body.images[0].candidates[0].confidence * 100);
        socket.emit("robot speak command", `Oh, I recognize you! Your name is ${recognized_individual}, I'm ${percent_confidence} percent sure of it!`);
        rotate_head(facing_teacher_angle);
      } else {
        rotate_head(facing_teacher_angle)
        // socket.emit("robot speak command", "I see a face but I don't know who it is.");
        enroll_face();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function enroll_face() {
  const file = fs.readFileSync('./pictures/capture.jpg', 'base64');

  var params = {
    image: file,
    gallery_name: "elliot_faces",
    subject_id: "Rapunzel"
  };

  client.enroll(params)
    .then(function(result) {
      console.log(result);
      socket.emit("robot speak command", "Okay, I remember you know Rapunzel.");
    })
    .catch(function(err) {
      console.log(err);
    });
}
