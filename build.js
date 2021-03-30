// C:\Users\sdkca\Desktop\electron-workspace\build.js
var electronInstaller = require('electron-winstaller');

// In this case, we can use relative paths
var settings = {
    // Specify the folder where the built app is located
    appDirectory: './Spotiget-win32-x64',
    // Specify the existing folder where 
    outputDirectory: './Spotiget_setups',
    // The name of the Author of the app (the name of your company)
    authors: 'Zax',
    // The name of the executable of your built
    exe: './Spotiget.exe',
    loadingGif: './imgs/bibi_moula.gif',
    setupIcon: './imgs/logo_setup.ico',
};

resultPromise = electronInstaller.createWindowsInstaller(settings);

resultPromise.then(() => {
    console.log("The installers of your application were succesfully created !");
}, (e) => {
    console.log(`Well, sometimes you are not so lucky: ${e.message}`)
});