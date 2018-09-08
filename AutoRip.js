//All of the constants required throughout the script
const user = {};
const moment = require('moment');
const config = require('config');
const mkvDir = config.get('Path.mkvDir.Dir');
const movieRips = config.get('Path.movieRips.Dir');
const fileLog = config.get('Path.logToFiles.Enabled');
const logDir = config.get('Path.logToFiles.Dir');
const eject = config.get('Path.ejectDVDs.Enabled');
const makeMKV = '\"' + mkvDir + '\\makemkvcon.exe' + '\"';
const exec = require('child_process').exec;
const fs = require('fs');
const winEject = require('win-eject');
colors = require('colors/safe');

//Color theme settings for colored text
colors.setTheme({
    info: 'green',
    error: 'red',
    line1: ['white', 'bgBlack'],
    line2: ['black', 'bgWhite'],
    warning: ['white', 'bgRed']
});

Opener();
ripOrDip();

//Opening boilerplate
function Opener() {
    console.info(colors.line1('MakeMKV Auto Rip Copyright (C) 2018 Zac Ingoglia'));
    console.info(colors.line2('This program comes with ABSOLUTELY NO WARRANTY'));
    console.info(colors.line1('This is free software, and you are welcome to redistribute it under certain conditions.'));
    console.info(colors.line2('The full licence file can be found in the root folder of this software as "LICENSE.md"'));
    console.info(colors.line1('Please fully read the README.md file found in the root folder before using this software.'));
    console.info('');
    console.info('');
    console.info(colors.line1('---Welcome to MakeMKV Auto Rip v0.4.3---'));
    console.info(colors.line1('---Running in DEV Mode---'));
    console.info('');
    console.info(colors.line1('---Devloped by Zac Ingoglia---'));
    console.info(colors.line1('---Copyright 2018 Zac Ingoglia---'));
    console.info('');
    console.info('');
    console.info(colors.warning('WARNING--Ensure that you have configured the Default.json file before ripping--WARNING'));
    console.info('');
}

//Run program or exit
function ripOrDip() {
    console.info(colors.white.underline('Would you like to Auto Rip all inserted DVDs now?'));
    console.info(colors.white.underline('This includes both internal and USB DVD and Bluray drives.'));
    console.info('');
    console.info('Press' + colors.info(' 1 ') + 'to Rip.');
    console.info('Press' + colors.error(' 2 ') + 'to exit.');

    prompt("Rip or Dip? ")
        .then((TA) => {
            user.TA = TA;

            switch (TA) {
                case '1':
                    console.info(colors.info(moment().format('LTS') + ' - ' + 'Beginning AutoRip... Please Wait.'));
                    ripDVDs(movieRips);
                    break;
                case '2':
                    console.info(colors.error(moment().format('LTS') + ' - ' + 'Exiting...'));
                    process.exit();
                    break;
                default:
                    process.exit();
                    break;
            }

        })
        .catch((error) => {
            console.error(colors.error(moment().format('LTS') + ' - ' + "Critical Error, Must Abort!"));
            console.error(error);
            process.exit();
        })

    function prompt(question) {
        return new Promise((resolve, reject) => {
            const { stdin, stdout } = process;

            stdin.resume();
            stdout.write(question);

            stdin.on('data', data => resolve(data.toString().trim()));
            stdin.on('error', err => reject(err));
        });
    }
}

function validateFileDate() {
    // check data to make sure that you opened a valid file.

    //is the length of data greater than 0

    //split first line
    //did we get more than one line
    //does the first line have the expected number of elements in the array
    //get version number of app/file
    //does match our expected version
    //if we don't get an true result on any of the above then raise exception to let the user know that the file or version isn't valid.
    return; // "You have a bad file";
}

function validateDriveFileDate() {
    // check data to make sure that you opened a valid file.

    //is the length of data greater than 0

    //split first line
    //did we get more than one line
    //does the first line have the expected number of elements in the array
    //get version number of app/file
    //does match our expected version
    //if we don't get an true result on any of the above then raise exception to let the user know that the file or version isn't valid.
    return; // "You have a bad file";
}

function getDriveInfo(data) {

    var validationMessage = validateDriveFileDate(data);
    if (validationMessage) {
        return validationMessage;
    }

    var lines = data.split("\n");
    var validLines = lines
        .filter(line => {
            //Get array of line attributes
            var lineArray = line.split(",");

            //make sure that the first element starts with "DRV:"
            if ((lineArray[0].startsWith("DRV:"))) {

                //Ensure that the number in the second element is = 2...meaning we have media
                return (lineArray[1] == 2);
            }

        })
        .map(line => {
            var driveInfo = {
                driveNumber: line.split(",")[0].substring(4),
                title: makeTitleValidFolderPath(line.split(",")[5])
            }
            return driveInfo;

        });

    return validLines;

}

function getFileNumber(data) {

    var myTitleSectionValue = null,
        maxValue = 0;

    var validationMessage = validateFileDate(data);
    if (validationMessage) {
        return validationMessage;
    }

    var lines = data.split("\n");
    var validLines = lines.filter(line => line.startsWith("MSG:3028"));

    validLines.forEach(line => {

        var videoTimeString = line
            .split(",")[9]
            .replace(/['"]+/g, '');

        var videoTimeArray = videoTimeString.split(':');

        var videoTimeSeconds = getTimeInSeconds(videoTimeArray);

        //process the largest file.
        if (videoTimeSeconds > maxValue) {
            maxValue = videoTimeSeconds;
            myTitleSectionValue = line
                .split(",")[3] //split by comma and get the element with the title.
                .split(" ")[1] //get the element with the file number.
                .replace("#", '') - 1; //strip off the hashtag and subtract 1 from the file number.

        }
    });

    return myTitleSectionValue;

}

function makeTitleValidFolderPath(title) {
    //escape out any chars that are not valid for file name.
    return title.replace("\\", '')
        .replace("/", '')
        .replace(":", '')
        .replace("*", '')
        .replace("?", '')
        .replace("<", '')
        .replace(">", '')
        .replace("|", '')
        .replace(/['"]+/g, '');;
}

function getTimeInSeconds(timeArray) {
    return (+timeArray[0]) * 60 * 60 + (+timeArray[1]) * 60 + (+timeArray[2]);
}

function createUniqueFolder(outputPath, folderName) {

    var fs = require('fs');
    //console.log(outputPath, folderName)
    var dir = outputPath + '\\' + folderName;
    var folderCounter = 1;
    if (fs.existsSync(dir)) {
        while (fs.existsSync(dir + '-' + folderCounter)) {
            folderCounter++;
        }
        dir += '-' + folderCounter;
    }
    fs.mkdirSync(dir);
    return dir;
}

function createUniqueFile(logDir, fileName) {

    var fs = require('fs');
    var dir = logDir + '\\' + 'Log' + '-' + fileName;
    var fileCounter = 1;
    if (fs.existsSync(dir)) {
        while (fs.existsSync(dir + '-' + fileCounter)) {
            fileCounter++;
        }
        dir += '-' + fileCounter;
    }
    //fs.mkdirSync(dir); //This line may not be needed
    return dir;
}

function getCommandData() {

    return new Promise((resolve, reject) => {

        console.info(colors.info(moment().format('LTS') + ' - ' + 'Getting info for all discs...'));
        //console.log('mkv command', makeMKV + ' -r info disc:index')
        exec(makeMKV + ' -r info disc:index', (err, stdout, stderr) => {

            if (stderr) {
                reject(stderr);
            }

            //get the data for drives with discs.
            console.info(colors.info(moment().format('LTS') + ' - ' + 'Getting drive info...'));
            //console.log('Got Command Data Items', stdout);
            var driveInfo = getDriveInfo(stdout);

            //get an array of promises to get the file numbers for the longest file from each valid disc.
            var drivePromises = driveInfo.map(driveInfo => {

                return new Promise((resolve, reject) => {

                    console.info(colors.info(moment().format('LTS') + ' - ' + 'Getting file number for drive title ' + driveInfo.driveNumber + '-' + driveInfo.title + '.'));
                    exec(makeMKV + ' -r info disc:' + driveInfo.driveNumber, (err, stdout, stderr) => {

                        if (stderr) {
                            reject(stderr);
                        }

                        var fileNumber = getFileNumber(stdout);
                        console.info(colors.info(moment().format('LTS') + ' - ' + 'Got file info for ' + driveInfo.driveNumber + '-' + driveInfo.title + '.'));
                        resolve({
                            driveNumber: driveInfo.driveNumber,
                            title: driveInfo.title,
                            fileNumber: fileNumber
                        });

                    });

                });

            });

            Promise.all(drivePromises)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });

    });
}

function processArray(array, fn, outputPath) {
    var results = [];
    return array.reduce((p, item) => {
        return p.then(() => {
            return fn(item, outputPath).then((data) => {
                results.push(data);
                return results;
            });
        });
    }, Promise.resolve());
}

function ripDVD(commandDataItem, outputPath) {

    return new Promise((resolve, reject) => {

        var dir = createUniqueFolder(outputPath, commandDataItem.title);
        var fileName = createUniqueFile(logDir, commandDataItem.title);

        console.info(colors.info(moment().format('LTS') + ' - ' + 'Ripping Title ' + commandDataItem.title + ' to ' + dir + '...'));

        exec(makeMKV + ' -r mkv disc:' + commandDataItem.driveNumber + ' ' + commandDataItem.fileNumber + ' ' + '\"' + dir + '\"', (err, stdout, stderr) => {

            if (stderr) {
                console.error(colors.error(moment().format('LTS') + ' - ' + 'Critical Error Ripping ' + commandDataItem.title, stderr));
                reject(stderr);
            } else {
                //console.log(colors.blue('OUTPUT', stdout)); //Outputs full log data to console after ripping (or attempting to rip) each DVD
                createLogFile();
                console.info(colors.info(moment().format('LTS') + ' - ' + 'Done Ripping ' + commandDataItem.title));
                resolve(commandDataItem.title);
            }

        });

    });
}

function createLogFile() {
    if (fileLog == 'True') {
        fs.writeFile(fileName + '.txt', stdout, 'utf8',
            function (err) {
                if (err) throw err;
                console.info(colors.info(moment().format('LTS') + ' - ' + 'Full Log file for ' + commandDataItem.title + ' has been written to file'));
            });
    } else {
        console.info('');
    }
}

function ripDVDs(outputPath) {

    getCommandData()

        .then(commandDataItems => {

            //Rip the DVDs synchonously.
            processArray(commandDataItems, ripDVD, outputPath)
                .then((result) => {
                    console.info(colors.info(moment().format('LTS') + ' - ' + 'The following DVD titles have been successfully ripped.'), colors.cyan(result));
                    ejectDVDs();
                    process.exit();
                    // all done here
                    // array of data here in result
                }, (reason) => {
                    console.error(colors.error(moment().format('LTS') + ' - ' + 'Error Ripping One or More DVDs.', reason));
                    // rejection happened
                });

        })
        .catch(err => {
            console.error(colors.info(moment().format('LTS') + ' - ' + err));
        });

}

function ejectDVDs(winEject) {
    if (eject == 'True') {
        winEject.eject();
        console.info(colors.info(moment().format('LTS') + ' - ' + 'All DVDs have been ejected.'));
    } else {
        console.info('');
    }

}