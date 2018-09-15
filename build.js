/**
 * Created by Serge P <contact@sergerusso.com> on 11/2/16.
 */


var fs = require('fs'),
  args = process.argv.slice(2),
  platform = args[0] && args[0].toLowerCase(),
  platforms = ['win32','win64','osx32','osx64','linux32','linux64'],
  NwBuilder,
  nw;

try{
  NwBuilder = require('nw-builder')
}catch(e){
  console.log("No nw-builder found.\nnpm install nw-builder --save-dev")
  return
}


if(platforms.indexOf(platform) == -1){
  console.log("Please specify target platform (win32, win64, osx32, osx64, linux32, linux64)")
  return;
}

nw = new NwBuilder({
  files: ['**', '!build.js','!README.md', '!**/build/**', '!cache/**'], // use the glob format
  platforms: [platform],
  flavor:'normal',
  version: 'latest',
  zip:false,
  winIco: 'assets/images/favicon.ico',
  macIcns: 'assets/images/favicon.icns'
})

console.log('Starting...');

nw.build().then(function () {
  console.log('all done!');

  if(['linux64', 'linux32'].includes(platform)){
    //rename executable to deal with wrong mimetype
    let executable = `./build/FeedBundle/${platform}/FeedBundle`
    fs.rename(executable, executable+".sh", function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });

  }
}).catch(function (error) {
  console.log(error);
});


/*
todo create for linux distr
 [Desktop Entry]
 Name=Run
 Exec=Exec=sh -c "$(dirname %k)/FeedBundle"
 Terminal=true
 Type=Application

 */