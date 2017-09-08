/**
 * create token at https://github.com/settings/tokens/new 
 * usage: >node index.js --access_token 1e70d0d724c4abeb02f55032d2403b955f7d90a4
*/

var fn, uniformer;

require('shelljs/global');

uniformer = require('uniformer');

var config;
if (!which("git")) {
  echo("Sorry, this script requires git");
  exit(1);
}
config = uniformer({
  defaults: {
    repositories: {
      type: "private",
      sort: "full_name"
    },
    directory: pwd()
  }
});
if (config["access_token"] == null) {
  echo("Sorry, this script requires an access_token");
  exit(1);
}

// Set the headers
var headers = {
    'User-Agent': 'node-github-clone'
};

// Configure the request
var options = {
    hostname: "api.github.com",
    port: 443,
    path: "/user/repos?type=" + config["repositories"]["type"] + "&sort=" + config["repositories"]["sort"] + "&access_token=" + config["access_token"]+"&per_page=100",
    //path: "/user/repos?type=" + config["repositories"]["type"] + "&sort=" + config["repositories"]["sort"] + "&access_token=" + config["access_token"]+"&per_page=100&page=2",
    headers: headers
};

require('https').get(options, function(res) {
  var data;
  data = "";
  res.on("data", function(chunk) {
    data += chunk;
  });
  res.on("end", function() {
    var folder, fs, repo, repos, _i, _len, _results;    
    repos = JSON.parse(data);
    cd(config["directory"]);
    fs = ls('.');
    _results = [];
    for (_i = 0, _len = repos.length; _i < _len; _i++) {
      repo = repos[_i];    
      folder = repo["git_url"].replace(new RegExp(".git$"), '').split("/");
      folder = folder[folder.length - 1];
      if (fs.indexOf(folder) === -1) {
        exec('git clone ' + repo["clone_url"], function(code, output) {
          console.log('Exit code:', code);
          console.log('Program output:', output);
        });
      } else {
        cd(folder);
        //exec('git checkout ' + repo["default_branch"]);
        //exec('git pull origin ' + repo["default_branch"]);
        cd("..");
      }
    }    
  });
}).on('error', function(e) {
  console.log("REQUEST ERROR: " + e.message);
});
