// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

const { exec } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const messenger = require("messenger");
const client = messenger.createSpeaker(32718);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let ostype;
let resources_dir;
let enabledRainbowFart = true;
let enabledInteractWithWaifu = true;
let inputDetectInterval = 5000;
let voicePackageName = "justkowalski";
let vpPath;
let contributions;

async function enabledRainbowFartWaifu() {
  debugLog("Extension Start");
  debugLog("Now Time: " + Date.now());
  ostype = os.type;
  debugLog("Now OS: " + ostype);

  const mp3Player =
    ostype == "Darwin"
      ? "afplay"
      : path.posix.join(resources_dir, "players", "mp3player.exe");

  setupVoicePackage();

  let voice_mark = "";
  let last_voice_mark = "";
  let pre = 0;

  vscode.workspace.onDidChangeTextDocument(evt => {
    const e = evt;
    var activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return;
    }
    const { text } = activeEditor.document.lineAt(
      activeEditor.selection.active.line
    );

    if (text.length > 50) return;
    parseLine(text);
  });

  function parseLine(str) {
    const now = new Date();
    if (now - pre < inputDetectInterval) {
      return;
    }
    pre = now;

    let voices = [];
    let hited_item;
    hitkeyword: for (let i = contributions.length - 1; i >= 0; i--) {
      const contribution = contributions[i];
      const keywords = contribution.keywords;
      for (let j = keywords.length - 1; j >= 0; j--) {
        if (str.indexOf(keywords[j]) >= 0) {
          hited_item = contribution;
          const keyword = keywords[j];
          voice_mark = keyword;
          voices = contribution.voices;
          break hitkeyword;
        }
      }
    }

    if (voices.length != 0) {
      debugLog("Catch Keyword：" + voice_mark);

      // randomly pick voice in voices
      let voice_index = Math.floor(Math.random() * voices.length);
      if (enabledRainbowFart) {
        debugLog("Ready to play：");
        last_voice_mark = voice_mark;

        let playerpath = mp3Player;
        let audiopath = path.posix.join(vpPath, voices[voice_index]);

        const cmd = '"' + playerpath + '" "' + audiopath + '"';
        debugLog(cmd);
        exec(cmd);
      } else {
        debugLog("Rainbow Fart Voice is Disabled");
      }

      if (enabledInteractWithWaifu) {
        showWifeMotion();

        if (hited_item.texts) {
          let text = hited_item.texts[voice_index];
          showWifeTextBubble(text);
        }
      }
    }
  }
}

function debugLog(str) {
  console.log(str);
}

function changeWifeModel() {
  client.shout("changeModel", {
    model: path.posix.join(lpPath, "model.json")
  });
}

function showWifeMotion(motionfile) {
  debugLog("Tell Waifu Change Motion: " + (motionfile ? motionfile : "Random"));
  client.shout("changeMotion", {
    motionfile: motionfile
  }); //motionfile
}

function showWifeTextBubble(str) {
  debugLog("Tell Waifu Show Bubble " + str);
  client.shout("say", {
    text: str
  });
}

function showInformation(msg) {
  vscode.window.showInformationMessage(msg);
}

function setupVoicePackage() {
  vpPath = path.posix.join(resources_dir, "voicepackages", voicePackageName);
  if (!fs.existsSync(vpPath)) {
    showInformation("Not found " + voicePackageName);
  } else if (!fs.existsSync(path.posix.join(vpPath, "contributes.json"))) {
    showInformation("Not found contributes.json in this voice package");
  } else {
    debugLog("enabled voice package: " + voicePackageName);
  }

  //语音包配置表
  contributions = JSON.parse(
    fs.readFileSync(path.posix.join(vpPath, "contributes.json"))
  ).contributes;
  debugLog(contributions);
}

function showRFWCommands() {
  vscode.window
    .showQuickPick(
      [
        "Turn " + (enabledRainbowFart ? "Off" : "On") + " Rainbow Fart Voice",
        "Switch Voice Packages",
        "Switch Waifu Models",
        "Open Resource Directory",
        "Download Waifu Container and More Resources"
      ],
      {
        canPickMany: false,
        ignoreFocusOut: false,
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: "🌈 Rainbow Fart Waifu Commands"
      }
    )
    .then(function (msg) {
      if (msg === "Switch Voice Packages") {
        quickPickVoicePackages();
      } else if (msg === "Switch Waifu Models") {
        quickPickWaifuModel();
      } else if (msg === "Open Resource Directory") {
        openResourceDir();
      } else if (msg === "Download Waifu Container and More Resources") {
        openWebsite();
      } else if (
        msg === "Turn On Rainbow Fart Voice" ||
        msg === "Turn Off Rainbow Fart Voice"
      ) {
        enabledRainbowFart = !enabledRainbowFart;
        vscode.window.showInformationMessage(
          "Rainbow Fart Voice is " +
            (enabledRainbowFart ? "Enabled" : "Disabled")
        );
      }
    });
}

function quickPickVoicePackages() {
  var vpDir = path.posix.join(resources_dir, "voicepackages");
  var res = [],
    files = fs.readdirSync(vpDir);
  files.forEach(function (filename) {
    var filepath = path.posix.join(vpDir, filename),
      stat = fs.lstatSync(filepath);

    if (stat.isDirectory()) {
      res.push({
        label: filename,
        description: filename == voicePackageName ? "in use" : ""
      });
    }
  });

  const pickResult = vscode.window.showQuickPick(res, {
    placeHolder: "Switch Voice Packages"
  });
  pickResult.then(function (result) {
    if (!result) {
      return;
    }
    if (result.description == "") {
      voicePackageName = result.label;
      setupVoicePackage();
    }
  });
}

function quickPickWaifuModel() {
  var vpDir = path.posix.join(resources_dir, "live2dpackages");
  var res = [],
    files = fs.readdirSync(vpDir);
  files.forEach(function (filename) {
    var filepath = path.posix.join(vpDir, filename),
      stat = fs.lstatSync(filepath);

    if (stat.isDirectory()) {
      res.push(filename);
    }
  });

  const pickResult = vscode.window.showQuickPick(res, {
    placeHolder: "Switch Waifu Model"
  });
  pickResult.then(function (result) {
    if (!result) {
      return;
    }

    lpPath = path.posix.join(vpDir, result);
    changeWifeModel();
  });
}

function openResourceDir() {
  let openpath = path.posix.join("file:", resources_dir);
  vscode.env.openExternal(openpath);
}

function openWebsite() {
  vscode.env.openExternal("https://rfw.jnsii.com");
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  resources_dir = path.posix.join(__dirname, "resources");
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "rainbow-fart-waifu" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('rainbow-fart-waifu.enable', function () {
  // 	// The code you place here will be executed every time your command is executed

  // 	// Display a message box to the user
  // 	// vscode.window.showInformationMessage('Hello World from rainbow-fart-waifu!');
  // 	enabledRainbowFartWaifu();
  // });
  // context.subscriptions.push(disposable);

  enabledRainbowFartWaifu();

  let disposable2 = vscode.commands.registerCommand(
    "rainbow-fart-waifu.showcommands",
    function () {
      showRFWCommands();
    }
  );

  context.subscriptions.push(disposable2);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
