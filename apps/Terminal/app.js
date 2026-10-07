const commandDefinitions = [
  { name: "help", usage: "help", description: "List commands and usage." },
  { name: "whoami", usage: "whoami", description: "Show the current demo user." },
  { name: "pwd", usage: "pwd", description: "Print the current virtual directory." },
  { name: "ls", usage: "ls [path]", description: "List files in a virtual folder." },
  { name: "cd", usage: "cd [path]", description: "Change virtual directory." },
  { name: "clear", usage: "clear", description: "Clear terminal output." },
  { name: "echo", usage: "echo [text]", description: "Print text to the terminal." },
  { name: "date", usage: "date", description: "Show the current date and time." },
  { name: "hostname", usage: "hostname", description: "Show this demo computer's name." },
  { name: "uname", usage: "uname [-a]", description: "Show the demo operating system." },
  { name: "uptime", usage: "uptime", description: "Show how long this page has been open." },
  { name: "history", usage: "history", description: "Show commands entered this session." },
  { name: "neofetch", usage: "neofetch", description: "Display a small system summary." },
  { name: "about", usage: "about", description: "Learn about this browser terminal." },
  { name: "man", usage: "man <command>", description: "Show help for one command." },
  { name: "mkdir", usage: "mkdir <name>", description: "Create a virtual directory." },
  { name: "touch", usage: "touch <name>", description: "Create an empty virtual file." },
  { name: "cat", usage: "cat <file>", description: "Read a demo text file." },
  { name: "open", usage: "open <folder>", description: "Open a virtual folder." },
  { name: "exit", usage: "exit", description: "Return to a clean terminal prompt." },
];

const output = document.querySelector("#terminal-output");
const input = document.querySelector("#command-input");
const form = document.querySelector("#command-form");
const promptPath = document.querySelector("#prompt-path");
const statusMessage = document.querySelector("#status-message");
const startedAt = Date.now();
const history = [];
let historyIndex = 0;
let workingDirectory = ["home", "guest"];

const virtualFiles = new Map([
  ["/home/guest/README.txt", "Welcome to Luma Terminal!\nThis is a safe, simulated shell running in your browser.\nTry `help` to see all available commands."],
  ["/home/guest/notes.txt", "A little command line goes a long way.\nHave fun exploring!"],
]);

const virtualDirectories = new Set([
  "/",
  "/home",
  "/home/guest",
  "/home/guest/Documents",
  "/home/guest/Downloads",
  "/home/guest/Pictures",
]);

function currentPath() {
  return `/${workingDirectory.filter(Boolean).join("/")}` || "/";
}

function displayPath(path = currentPath()) {
  if (path === "/home/guest") return "~";
  if (path.startsWith("/home/guest/")) return `~/${path.slice("/home/guest/".length)}`;
  return path;
}

function updatePrompt() {
  promptPath.textContent = displayPath();
}

function addResult(text, className = "") {
  if (!text) return;
  const result = document.createElement("pre");
  result.className = `command-result${className ? ` ${className}` : ""}`;
  result.textContent = text;
  output.append(result);
}

function addCommandLine(command) {
  const line = document.createElement("div");
  line.className = "command-line";
  const prompt = document.createElement("span");
  prompt.className = "prompt-user";
  prompt.textContent = "guest@luma";
  const colon = document.createElement("span");
  colon.textContent = ":";
  const path = document.createElement("span");
  path.className = "prompt-path";
  path.textContent = displayPath();
  const dollar = document.createElement("span");
  dollar.textContent = "$";
  const typed = document.createElement("span");
  typed.textContent = command;
  line.append(prompt, colon, path, dollar, typed);
  output.append(line);
}

function scrollToBottom() {
  output.scrollTop = output.scrollHeight;
}

function refreshPromptAndScroll() {
  updatePrompt();
  scrollToBottom();
}

function listDirectory(path) {
  const directory = resolvePath(path || ".");
  if (!virtualDirectories.has(directory)) {
    return { error: `ls: cannot access '${path}': No such directory` };
  }
  const names = new Set();
  const prefix = directory === "/" ? "/" : `${directory}/`;
  for (const child of virtualDirectories) {
    if (child === directory || !child.startsWith(prefix)) continue;
    const name = child.slice(prefix.length).split("/")[0];
    if (name) names.add(`${name}/`);
  }
  for (const filePath of virtualFiles.keys()) {
    if (!filePath.startsWith(prefix)) continue;
    const name = filePath.slice(prefix.length).split("/")[0];
    if (name && !filePath.slice(prefix.length).includes("/")) names.add(name);
  }
  const sorted = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return { result: sorted.length ? sorted.join("    ") : "(empty directory)" };
}

function resolvePath(path) {
  if (!path || path === "~") return "/home/guest";
  const parts = path.startsWith("/") ? [] : [...workingDirectory];
  const normalized = path.replace(/^~(?=\/|$)/, "/home/guest");
  for (const part of normalized.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return `/${parts.join("/")}` || "/";
}

function parseInput(text) {
  const args = [];
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
  for (const match of text.matchAll(regex)) args.push(match[1] ?? match[2] ?? match[3]);
  return args;
}

function formatUptime() {
  const totalSeconds = Math.floor((Date.now() - startedAt) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function helpText(commandName) {
  if (commandName) {
    const command = commandDefinitions.find((item) => item.name === commandName);
    return command
      ? `${command.usage}\n${command.description}`
      : `man: no manual entry for ${commandName}`;
  }
  return [
    "Luma Terminal — available commands",
    "",
    ...commandDefinitions.map((command) => `  ${command.usage.padEnd(23)} ${command.description}`),
    "",
    "This is a simulated shell. It does not execute system commands or access your computer.",
  ].join("\n");
}

function runCommand(rawCommand) {
  const args = parseInput(rawCommand);
  if (!args.length) return;
  const commandName = args.shift().toLowerCase();
  let result = "";
  let resultClass = "";

  switch (commandName) {
    case "help":
      result = helpText();
      break;
    case "whoami":
      result = "guest";
      break;
    case "pwd":
      result = currentPath();
      break;
    case "ls": {
      const listing = listDirectory(args[0]);
      result = listing.result || listing.error;
      if (listing.error) resultClass = "error";
      break;
    }
    case "cd": {
      const destination = resolvePath(args[0] || "~");
      if (!virtualDirectories.has(destination)) {
        result = `cd: no such directory: ${args[0] || destination}`;
        resultClass = "error";
      } else {
        workingDirectory = destination.split("/").filter(Boolean);
        updatePrompt();
      }
      break;
    }
    case "clear":
      output.replaceChildren();
      statusMessage.textContent = "Terminal cleared";
      return;
    case "echo":
      result = args.join(" ");
      break;
    case "date":
      result = new Date().toString();
      break;
    case "hostname":
      result = "luma-desktop";
      break;
    case "uname":
      result = args.includes("-a")
        ? "LumaOS browser-sandbox 1.0.0 web x86_64"
        : "LumaOS";
      break;
    case "uptime":
      result = `up ${formatUptime()}`;
      break;
    case "history":
      result = history.length
        ? history.map((entry, index) => `${String(index + 1).padStart(3)}  ${entry}`).join("\n")
        : "No commands yet.";
      break;
    case "neofetch":
      result = [
        "       .--.       guest@luma",
        "      |o_o |      ----------------",
        "      |:_/ |      OS: LumaOS (browser demo)",
        "     //   \\ \\     Shell: Luma Terminal",
        "    (|     | )    Directory: " + displayPath(),
        "   /'\\_   _/`\\    Uptime: " + formatUptime(),
        "   \\___)=(___/    Commands: " + commandDefinitions.length,
      ].join("\n");
      break;
    case "about":
      result = "Luma Terminal is a small simulated command line built with HTML, CSS, and JavaScript.\nIt runs locally in this page and never executes commands on your computer.";
      break;
    case "man":
      result = args[0] ? helpText(args[0]) : "Usage: man <command>";
      if (args[0] && !commandDefinitions.some((item) => item.name === args[0])) resultClass = "error";
      break;
    case "mkdir": {
      if (!args[0]) {
        result = "mkdir: missing directory name";
        resultClass = "error";
        break;
      }
      const path = resolvePath(args[0]);
      if (virtualDirectories.has(path) || virtualFiles.has(path)) {
        result = `mkdir: '${args[0]}' already exists`;
        resultClass = "error";
      } else {
        virtualDirectories.add(path);
        result = `Created directory ${args[0]}`;
        resultClass = "success";
      }
      break;
    }
    case "touch": {
      if (!args[0]) {
        result = "touch: missing file name";
        resultClass = "error";
        break;
      }
      const path = resolvePath(args[0]);
      if (virtualDirectories.has(path)) {
        result = `touch: '${args[0]}' is a directory`;
        resultClass = "error";
      } else {
        if (!virtualFiles.has(path)) virtualFiles.set(path, "");
        result = `Created file ${args[0]}`;
        resultClass = "success";
      }
      break;
    }
    case "cat": {
      if (!args[0]) {
        result = "cat: missing file name";
        resultClass = "error";
        break;
      }
      const path = resolvePath(args[0]);
      result = virtualFiles.has(path) ? virtualFiles.get(path) || "(empty file)" : `cat: ${args[0]}: No such file`;
      if (!virtualFiles.has(path)) resultClass = "error";
      break;
    }
    case "open": {
      const path = resolvePath(args[0] || ".");
      if (!virtualDirectories.has(path)) {
        result = `open: no such directory: ${args[0] || path}`;
        resultClass = "error";
      } else {
        workingDirectory = path.split("/").filter(Boolean);
        updatePrompt();
        result = `Opened ${displayPath()}`;
        resultClass = "success";
      }
      break;
    }
    case "exit":
      workingDirectory = ["home", "guest"];
      updatePrompt();
      result = "Session reset. Welcome back, guest.";
      break;
    default:
      result = `${commandName}: command not found. Type 'help' to see available commands.`;
      resultClass = "error";
  }

  if (result) addResult(result, resultClass);
  statusMessage.textContent = resultClass === "error" ? "Command finished with an error" : "Command completed";
  scrollToBottom();
}

function submitCommand(command) {
  const value = command.trim();
  if (!value) return;
  addCommandLine(value);
  history.push(value);
  historyIndex = history.length;
  runCommand(value);
  refreshPromptAndScroll();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const command = input.value;
  input.value = "";
  submitCommand(command);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (history.length) {
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || "";
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] || "";
  } else if (event.key === "Tab") {
    event.preventDefault();
    const match = commandDefinitions.find((command) => command.name.startsWith(input.value.trim()));
    if (match) input.value = match.name;
  }
});

document.querySelector("#clear-button").addEventListener("click", () => {
  output.replaceChildren();
  statusMessage.textContent = "Terminal cleared";
  input.focus();
});

function setActiveTab(name) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelector("#terminal-panel").hidden = name !== "terminal";
  document.querySelector("#commands-panel").hidden = name !== "commands";
  if (name === "terminal") input.focus();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

function renderCommandList() {
  const list = document.querySelector("#command-list");
  const commandExamples = {
    help: "help",
    whoami: "whoami",
    pwd: "pwd",
    ls: "ls",
    cd: "cd Documents",
    clear: "clear",
    echo: "echo Hello from Luma",
    date: "date",
    hostname: "hostname",
    uname: "uname -a",
    uptime: "uptime",
    history: "history",
    neofetch: "neofetch",
    about: "about",
    man: "man whoami",
    mkdir: "mkdir new-folder",
    touch: "touch new-file.txt",
    cat: "cat README.txt",
    open: "open Documents",
    exit: "exit",
  };
  commandDefinitions.forEach((command) => {
    const card = document.createElement("article");
    card.className = "command-card";
    const name = document.createElement("code");
    name.className = "command-name";
    const [base, ...usageParts] = command.usage.split(" ");
    name.textContent = base;
    if (usageParts.length) {
      const usage = document.createElement("span");
      usage.textContent = ` ${usageParts.join(" ")}`;
      name.append(usage);
    }
    const description = document.createElement("span");
    description.className = "command-description";
    description.textContent = command.description;
    const run = document.createElement("button");
    run.className = "run-command";
    run.type = "button";
    run.textContent = "Run";
    run.addEventListener("click", () => {
      setActiveTab("terminal");
      submitCommand(commandExamples[command.name]);
      input.focus();
    });
    card.append(name, description, run);
    list.append(card);
  });
}

renderCommandList();
updatePrompt();
