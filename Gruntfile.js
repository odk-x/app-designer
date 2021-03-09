'use strict';
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 8000;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var mountFolder = function (connect, dir) {
    return serveStatic(
        require('path').resolve(dir),
        {
            // We need to specify a file that will be displayed in place of
            // index.html. _.html is used because it is unlikely to exist.
            index: '_.html'
        }
    );
};
var mountDirectory = function(connect, dir) {
    return serveIndex(
        require('path').resolve(dir),
        {
            icons: true,
        }
    );
};

var postHandler = function(req, res, next) {
    if (req.method === 'POST') {
        //debugger;

        console.log('received a POST request');

        var mkdirp = require('mkdirp');
        var fs = require('fs');
        //var Buffer = require('buffer/').Buffer;

        // We don't want the leading /, or else the file system will think
        // we're writing to root, which we don't have permission to. Should
        // really be dealing with the path more gracefully.
        var path = req.url.substring(1);

        // First make sure the directory exists, or else the following call to
        // createWriteStream fails. We don't want to include the file name as
        // part of the directory, or else our post will be trying to change the
        // directory to become a file with content, which will fail.
        var lastDelimiter = path.lastIndexOf('/');
        if (lastDelimiter >= 0) {
            var directories = path.substring(0, lastDelimiter);
            mkdirp.sync(directories);
        }

		var file;
        if (req.headers['content-type'] === 'application/octet-stream') {
            var base64 = require('base64-stream');

            file = fs.createWriteStream(path);
            req.pipe(base64.decode()).pipe(file);

            file.on('error', function(err) {
                res.write('error uploading the file');
                res.write(JSON.stringify(err));
                res.statusCode = 500;
                console.log('POST error ' + JSON.stringify(err));
            });

            req.on('end', function() {
                res.write('uploaded file!');
                res.end();
            });

        } else {
            file = fs.createWriteStream(path);
            req.pipe(file);

            file.on('error', function(err) {
                res.write('error uploading the file');
                res.write(JSON.stringify(err));
                res.statusCode = 500;
            });

            req.on('end', function() {
                res.write('uploaded file!');
                res.end();
            });
        }

    } else {
        // We only want to hand this off to the other middleware if this
        // is not a POST, as we're expecting to be the only ones to
        // handle POSTs.
        return next();
    }
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'
// templateFramework: 'lodash'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // passing in port as input
    SERVER_PORT = grunt.option('port') || 8000;

    // We do not want the default behavior of serving only the app folder.
    // Instead we want to serve the base repo directory, as this will give us
    // access to the test dir as well. Further, if you don't have a homescreen
    // defined, it doesn't really make sense to have a single index.html.
    var baseDirForServer = '';
    var tablesConfig = {
        // The base app directory. Note that if you modify this you should
        // also modify the other properties in this object that refer to
        // app
        appDir: 'app',
        appName: 'default',
        // The mount point of the device. Should allow adb push/pull.
        deviceMount: '/sdcard/opendatakit',
        // The mount point of the device for odk collect forms.
        formMount: '/sdcard/odk/forms',
        assetsDir: 'app/config/assets',
        // The directory where the 'tables' directory containing the tableId
        // directories lives.
        tablesDir: 'app/config/tables',
        dataDir: 'app/data',
        // Where the templates for a new tableId folder lives. i.e. if you want
        // to add a table, the contents of this directory would be copied to
        // tablesDir/tableId.
        tableTemplateDir: 'grunttemplates/table/default',
        // tableIdStr will be what we replace in the table template with the
        // provided tableId. E.g. '../%TABLE_ID%_list.html' will become
        // '../myTableId_list.html'
        tableIdStr: '%TABLE_ID%',
        // The string we need to replace with the app name.
        appStr: '%APP%',
        // The output directory
        outputDbDir: 'output/db',
        // The directory where csvs are output.
        outputCsvDir: 'output/csv',
        // The directory where the device.properties and app.properties objects are stored
        outputPropsDir: 'output/props',
        // The directory where logs are output
        outputLogsDir: 'output/logging',
        // The directory where the debug objects are output.
        outputDebugDir: 'output/debug',
        // The db directory path on the phone. %APP% should be replaced by app name
		// We use write-ahead-logging, so we need to pull both sqlite.db and sqlite.wal
        deviceDbDirectoryPath: '/sdcard/opendatakit/%APP%/data/webDb',
        xlsxDir: 'xlsxconverter'

    };

    var surveyConfig = {
        // The base app directory. Note that if you modify this you should
        // also modify the other properties in this object that refer to
        // app
        appDir: 'app',
        appName: 'survey',
        // The mount point of the device. Should allow adb push/pull.
        deviceMount: '/sdcard/opendatakit',
        xlsxDir: 'xlsxconverter'

    };

    grunt.initConfig({
        // Here we have to set the objects for the exec task. We are using
        // grunt-exec to execute the adb push and adb pull commands.
        // cmd is the command that is run when calling this task with the
        // target and must return a string.
        exec: {
            adbpush: {
                cmd: function(src, dest) {
                    return 'adb push ' + src + ' ' + dest;
                }
            },
            adbpull: {
                cmd: function(src, dest) {
                    return 'adb pull ' + src + ' ' + dest;
                }
            },
            adbshell: {
                cmd: function(str) {
                    return 'adb shell ' + str;
                }
            },
			macGenConvert: {
				cmd: function(str, formDefFile) {
					return 'node macGenConverter.js ' + str + ' > ' + formDefFile; 
				}
			}
        },

        tables: tablesConfig,
        watch: {
            options: {
                nospawn: true,
                livereload: true
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= tables.appDir %>/*.html',
                    '<%= tables.appDir %>/system/**',
                ]
            },
            test: {
                files: ['test/spec/**/*.js'],
                tasks: ['test']
            }
        },
        connect: {
            options: {
                port: SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            postHandler,
                            lrSnippet,
                            mountFolder(connect, baseDirForServer),
                            mountDirectory(connect, baseDirForServer)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 8001,
                    middleware: function (connect) {
                        return [
                            postHandler,
                            lrSnippet,
                            mountFolder(connect, 'test'),
                            mountFolder(connect, baseDirForServer),
                            mountDirectory(connect, baseDirForServer)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>/index.html',
                app: {app: (function() {
                    var platform = require('os').platform();
                    // windows: *win*
                    // mac: darwin
                    if (platform.search('win') >= 0 &&
                      platform.search('darwin') < 0) {
                      // Windows expects chrome.
                      grunt.log.writeln('detected Windows environment');
                      return 'chrome';
                    } else {
                      // Mac (and maybe others--add as discovered), expects
                      // Google Chrome
                      grunt.log.writeln('detected non-Windows environment');
                      return 'Google Chrome';
                    }
                  })()
                }
            }
        },
    });

    // We need grunt-exec to run adb commands from within grunt.
    grunt.loadNpmTasks('grunt-exec');

    // Just an alias task--shorthand for doing all the pullings
    grunt.registerTask(
        'adbpull',
        'Perform all the adbpull tasks',
        ['adbpull-debug', 'adbpull-db', 'adbpull-csv', 'adbpull-logs']);

    // Just an alias task--shorthand for doing all the pushings
    grunt.registerTask(
        'adbpush',
        'Perform all the adbpush tasks',
        ["adbpull-props", "remove-folders", 'adbpush-collect', 'adbpush-default-app', "adbpush-props"]);

    grunt.registerTask(
        'clean',
        'wipe the device',
        ["adbpull-props", "remove-folders", "adbpush-props", "setup"]);


    grunt.registerTask(
        'adbpull-debug',
        'Pull the debug output objects from the device',
        function() {
            var src = tablesConfig.deviceMount + '/' + tablesConfig.appName +
                '/' + tablesConfig.outputDebugDir;
            var dest = tablesConfig.appDir + '/' + tablesConfig.outputDebugDir;
            grunt.log.writeln('adb pull ' + src + ' ' + dest);
            grunt.task.run('exec:adbpull:' + src + ':' + dest);
        });

    grunt.registerTask(
        'adbpull-db',
        'Pull the db from the device',
        function() {
            var dbPath = tablesConfig.deviceDbDirectoryPath;
            dbPath = dbPath.replace(tablesConfig.appStr, tablesConfig.appName);
            var src = dbPath;
            var dest = tablesConfig.appDir + '/' + tablesConfig.outputDbDir;
            grunt.log.writeln('adb pull ' + src + ' ' + dest);
            grunt.task.run('exec:adbpull:' + src + ':' + dest);
        });

    grunt.registerTask(
        'adbpull-csv',
        'Pull any exported csv files from the device',
        function() {
            var src = tablesConfig.deviceMount + '/' + tablesConfig.appName +
                '/' + tablesConfig.outputCsvDir;
            var dest = tablesConfig.appDir + '/' + tablesConfig.outputCsvDir;
            grunt.log.writeln('adb pull ' + src + ' ' + dest);
            grunt.task.run('exec:adbpull:' + src + ':' + dest);
        });


    grunt.registerTask(
        'adbpull-logs',
        'Pull any logs stored in the device for debugging purposes',
        function() {
            var src = tablesConfig.deviceMount + '/' + tablesConfig.appName + '/' + tablesConfig.outputLogsDir;
            var dest = tablesConfig.appDir + '/' + tablesConfig.outputLogsDir;
            grunt.log.writeln('adb pull ' + src + ' ' + dest);
            grunt.task.run('exec:adbpull:' + src + ':' + dest);
        });

    grunt.registerTask(
        'xlsx-convert-all',
        'Run the XLSX converter on all form definitions',
        function() {
			var platform = require('os').platform();
			var isWindows = (platform.search('win') >= 0 &&
                             platform.search('darwin') < 0);
							 
            var dirs = grunt.file.expand(
                {filter: function(path) {
 						if ( !path.endsWith(".xlsx") ) {
							return false;
						}
						var cells = path.split((isWindows ? "\\" : "/"));
						return (cells.length >= 6) &&
						  ( cells[cells.length-1] === cells[cells.length-2] + ".xlsx" ); 
					},
                 cwd: 'app' },
				'**/*.xlsx',
                '!**/~$*.xlsx'
				);

            // Now run these files through macGenConvert.js
            dirs.forEach(function(fileName) {
				// fileName uses forward slashes on all platforms
				var xlsFile;
				var formDefFile;
				var cells;
				xlsFile = 'app/' + fileName;
				cells = xlsFile.split('/');
				cells[cells.length-1] = 'formDef.json';
				formDefFile = cells.join('/');
				grunt.log.writeln('macGenConvert: ' + xlsFile + ' > ' + formDefFile);
				grunt.task.run('exec:macGenConvert:' + xlsFile + ':' + formDefFile);
            });
        });

var zipAllFiles = function( destZipFile, filesList, completionFn ) {
			// create a file to stream archive data to. 
			var fs = require('fs');
			var archiver = require('archiver');

			var output = fs.createWriteStream(destZipFile);
			var archive = archiver('zip', {
				store: true // Sets the compression method to STORE. 
			});
			 
			// listen for all archive data to be written 
			output.on('close', function() {
			  console.log(archive.pointer() + ' total bytes');
			  console.log('archiver has been finalized and the output file descriptor has closed.');
			  completionFn(true);
			});
			 
			// good practice to catch this error explicitly 
			archive.on('error', function(err) {
			  throw err;
			});
			 
			// pipe archive data to the file 
			archive.pipe(output);
				
			filesList.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                grunt.log.writeln('archive.file(' + src + ', {name: ' + fileName + '} )');
                archive.file(src, {name: fileName }, function(err) {
					  if(err) {
						grunt.log.writeln('error ' + err + ' adding ' + src + ' to file ' + destZipFile);
				}} );
			});
			// finalize the archive (ie we are done appending files but streams have to finish yet) 
			archive.finalize();
};

    grunt.registerTask(
        'build-zips',
        'BROKEN: does not compress and last file is not terminated properly. Construct the configzip and systemzip for survey and tables',
        function() {
			var done = this.async();
			
			var buildDir = 'build' +
				'/zips';
			 
			grunt.file.delete(buildDir + '/');
			
			grunt.file.mkdir(buildDir);
			grunt.file.mkdir(buildDir + '/survey/');
			grunt.file.mkdir(buildDir + '/tables/');

            var surveySystemZipFiles = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'system/survey/templates/**',
                'system/survey/js/**',
                'system/libs/**',
                'system/js/**',
                'system/index.html',
				'!**/.DS_Store',
                '!**/~$*.xlsx');

            var surveyConfigZipFiles = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'config/assets/framework/**',
                'config/assets/commonDefinitions.js',
                'config/assets/img/play.png',
                'config/assets/img/form_logo.png',
                'config/assets/img/backup.png',
                'config/assets/img/advance.png',
                'config/assets/css/odk-survey.css',
				'!**/.DS_Store',
                '!**/~$*.xlsx');

            var tablesSystemZipFiles = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'system/tables/test/**',
                'system/tables/js/**',
                'system/libs/**',
                'system/js/**',
				'!**/.DS_Store',
                '!**/~$*.xlsx');

            var tablesConfigZipFiles = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
                'config/assets/libs/jquery*',
                'config/assets/libs/d3*',
                'config/assets/libs/d3-amd/**',
                'config/assets/commonDefinitions.js',
                'config/assets/img/little_arrow.png',
				'!**/.DS_Store',
                '!**/~$*.xlsx');

			zipAllFiles(buildDir + '/survey/systemzip', surveySystemZipFiles, 
				function(outcome) {
					if ( outcome ) {
						zipAllFiles(buildDir + '/survey/configzip', surveyConfigZipFiles, 
							function(outcome) {
								if ( outcome ) {
									zipAllFiles(buildDir + '/tables/systemzip', tablesSystemZipFiles, 
										function(outcome) {
											if ( outcome ) {
												zipAllFiles(buildDir + '/tables/configzip', tablesConfigZipFiles, 
													function(outcome) {
														if ( outcome ) {
															grunt.log.writeln('success!');
															done(true);
														} else {
															done('failing on /tables/configzip with error: ' + outcome);
														}
													});
											} else {
												done('failing on /tables/systemzip with error: ' + outcome);
											}
										});
								} else {
									done('failing on /survey/configzip with error: ' + outcome);
								}
							});
					} else {
						done('failing on /survey/systemzip with error: ' + outcome);
					}
				});
		});

    grunt.registerTask(
        'adbpush-default-app',
        'Push everything in the app directory (except system) to the device',
        function() {
            // Do not push any system, data or output files.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
				'!data/**',
				'!output/**',
                '!**/~$*.xlsx');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });
        });

    grunt.registerTask(
        'adbpush-tables',
        'Push everything for tables only to the device',
        function() {
            // We do not need any system, data or output files.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
				'!data/**',
                '!output/**',
                '!**/~$*.xlsx');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

            // And then we want to put the collect forms in the right place.
            // This will push the collect forms for ALL the tables, but since
            // only the files used in the Tables demo follows the convention
            // required by the adbpush-collect task, that is ok.
            grunt.task.run('adbpush-collect');

        });

    grunt.registerTask(
        'adbpush-systemjs',
        'Push everything for tables only to the device',
        function() {
            // We do not need any system, data or output files.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
                'system/tables/js/**',
                'system/survey/**',
				'!data/**',
				'!output/**',
                '!config/**',
                '!**/~$*.xlsx');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

            // And then we want to put the collect forms in the right place.
            // This will push the collect forms for ALL the tables, but since
            // only the files used in the Tables demo follows the convention
            // required by the adbpush-collect task, that is ok.
            grunt.task.run('adbpush-collect');

        });

    grunt.registerTask(
        'adbpush-tables-demo-alpha2',
        'Push everything for tables demo to the device',
        function() {
            // In the alpha demo we want Tables and Survey. For the alpha2,
			// it had needed a push of the system files, but we won't do that
			// here. We only want a subset of the app/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
				'!system/**',
				'!data/**',
				'!output/**',
                '!config/tables/**',
                'config/tables/geotagger/**',
                'config/tables/Tea_houses/**',
                'config/tables/Tea_types/**',
                'config/tables/Tea_inventory/**',
                'config/tables/Tea_houses_editable/**',
                'config/tables/household/**',
                'config/tables/household_member/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

            // And then we want to put the collect forms in the right place.
            // This will push the collect forms for ALL the tables, but since
            // only the files used in the Tables demo follows the convention
            // required by the adbpush-collect task, that is ok.
            grunt.task.run('adbpush-collect');

        });

    grunt.registerTask(
        'adbpush-tables-demo-JGI',
        'Push everything for tables JGI demo to the device',
        function() {
            // In the alpha demo we want Tables and Survey. For this demo,
			// it had needed a push of the system files, but we won't do that
			// here. We only want a subset of the app/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
				'!system/**',
				'!data/**',
				'!output/**',
                '!config/tables/**',
                'config/tables/follow/**',
                'config/tables/follow_arrival/**',
                'config/tables/follow_map_position/**',
                'config/tables/follow_map_time/**',
                'config/tables/food_bout/**',
                'config/tables/groom_bout/**',
                'config/tables/mating_event/**',
                'config/tables/other_species/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        'adbpush-scan',
        'Push everything for scan tables to the device',
        function() {
            // In the alpha demo we want Tables and Survey. For this demo,
			// it had needed a push of the system files, but we won't do that
			// here. We only want a subset of the app/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
				'!system/**',
				'!data/**',
				'!output/**',
				'!config/assets/**',
                '!config/tables/**',
                'config/tables/scan_example/**',
                '!**/~$*.xlsx');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });
        });

	//
	// returns a function that will handle the copying of files into the
	// build/ + infix.substr(1) folder with any files containing ".infix."
	// stripped of that infix and any folders ending in ".infix" also stripped.
	//
	var infixRenameCopier = function(demoInfix, offsetDir) {
		return function(fileName) {
			//  Have to add app back into the file name for the adb push
			var src;
			if ( offsetDir !== undefined && offsetDir !== null && offsetDir !== "" ) {
				src = offsetDir +
					'/' +
					fileName;
			} else {
				src = fileName;
			}
			var isInfixed = false;
			// need to handle infixed directories and files
			var destFileName = fileName;
			var idx = destFileName.indexOf(demoInfix + ".");
			while ( idx >= 0 ) {
				// file...
				isInfixed = true;
				destFileName = destFileName.substring(0,idx) + destFileName.substring(idx+demoInfix.length);
				idx = destFileName.indexOf(demoInfix + ".");
			}
			
			var idxDir = destFileName.indexOf(demoInfix + "/");
			while ( idxDir >= 0 ) {
				// directory...
				isInfixed = true;
				destFileName = destFileName.substring(0,idxDir) + destFileName.substring(idxDir+demoInfix.length);
				idxDir = destFileName.indexOf(demoInfix + "/");
			}
			
			var buildDir = 'build' +
				'/' +
				demoInfix.substring(1);

			var baseDir = buildDir;

			if ( offsetDir !== undefined && offsetDir !== null && offsetDir !== "" ) {
				baseDir = baseDir +
					'/' +
					offsetDir;
			}

			var dest;
			if ( isInfixed ) {
				// copy the original so that, e.g, grunt adbpush-tables-tablesdemo will work
				dest = baseDir +
					'/' +
					fileName;
				grunt.log.writeln('file copy ' + src + ' ' + dest);
				grunt.file.copy(src, dest);
			}
			// and copy the renamed destination file so that
			// grunt adbpush will also work.
			dest = baseDir +
				'/' +
				destFileName;
			grunt.log.writeln('file copy ' + src + ' ' + dest);
			grunt.file.copy(src, dest);
		};
	};

	//
	// returns a function that will handle the adb push of files onto the
	// device with any files containing ".infix." stripped of that infix 
	// and any folders ending in ".infix" also stripped.
	//
	var infixRenameAdbPusher = function(demoInfix, offsetDir) {
		           // Now push these files to the phone.
        return function(fileName) {
			//  Have to add app back into the file name for the adb push
			var src;
			if ( offsetDir !== undefined && offsetDir !== null && offsetDir !== "" ) {
				src = offsetDir +
				'/' +
				fileName;
			} else {
				src = fileName;
			}

			var isInfixed = false;
			// need to handle infixed directories and files
			var destFileName = fileName;
			var idx = destFileName.indexOf(demoInfix + ".");
			while ( idx >= 0 ) {
				// file...
				isInfixed = true;
				destFileName = destFileName.substring(0,idx) + destFileName.substring(idx+demoInfix.length);
				idx = destFileName.indexOf(demoInfix + ".");
			}
			
			var idxDir = destFileName.indexOf(demoInfix + "/");
			while ( idxDir >= 0 ) {
				// directory...
				isInfixed = true;
				destFileName = destFileName.substring(0,idxDir) + destFileName.substring(idxDir+demoInfix.length);
				idxDir = destFileName.indexOf(demoInfix + "/");
			}

			var dest =
				tablesConfig.deviceMount +
				'/' +
				tablesConfig.appName +
				'/' +
				destFileName;
			grunt.log.writeln('adb push ' + src + ' ' + dest);
			grunt.task.run('exec:adbpush:' + src + ':' + dest);
		};
	};

	var largeDataSetFiles = function(grunt) {
        // We only want a subset of the app/tables files,
		// however. So, we are going to get everything except that
		// directory and then add back in the ones that we want.
		// The first parameter is an options object where we specify that
		// we only want files--this is important because otherwise when
		// we get directory names adb will push everything in the directory
		// name, effectively pushing everything twice.  We also specify that we
		// want everything returned to be relative to 'app' by using 'cwd'.
		var dirs = grunt.file.expand(
			{filter: 'isFile',
			 cwd: 'app' },
			'.nomedia',
			'**',
			'!system/**',
			'!data/**',
			'!output/**',
			'!config/tables/**',
			'config/assets/**',
            'config/tables/large_dataset/**',
            'config/tables/testRun/**');

		return dirs;
	};

    grunt.registerTask(
        'adbpush-largeDataSet500',
        'Push everything for large data set to the device',
        function() {
            var dirs = largeDataSetFiles(grunt);

            // Now push these files to the phone.
            dirs.forEach(infixRenameAdbPusher(".largeDataSet500", tablesConfig.appDir));
        }
    );

    grunt.registerTask(
        'adbpush-largeDataSet3000',
        'Push everything for large data set to the device',
        function() {
            var dirs = largeDataSetFiles(grunt);

            // Now push these files to the phone.
            dirs.forEach(infixRenameAdbPusher(".largeDataSet3000", tablesConfig.appDir));
        }
    );

	var gatesDemoFiles072216 = function(grunt) {
        // We only want a subset of the app/tables files,
		// however. So, we are going to get everything except that
		// directory and then add back in the ones that we want.
		// The first parameter is an options object where we specify that
		// we only want files--this is important because otherwise when
		// we get directory names adb will push everything in the directory
		// name, effectively pushing everything twice.  We also specify that we
		// want everything returned to be relative to 'app' by using 'cwd'.
		var dirs = grunt.file.expand(
			{filter: 'isFile',
			 cwd: 'app' },
			'.nomedia',
			'**',
			'!system/**',
			'!data/**',
			'!output/**',
			'!config/tables/**',
			'config/assets/**',
			'config/tables/child_coverage/**',
			'config/tables/femaleClients/**',
            'config/tables/follow/**',
            'config/tables/follow_arrival/**',
            'config/tables/follow_map_position/**',
            'config/tables/follow_map_time/**',
            'config/tables/food_bout/**',
            'config/tables/graphExample/**',
            'config/tables/gridScreen/**',
            'config/tables/geopoints/**',
            'config/tables/geotagger/**',
            'config/tables/groom_bout/**',
            'config/tables/household/**',
            'config/tables/household_member/**',
            'config/tables/maleClients/**',
            'config/tables/mating_event/**',
            'config/tables/other_species/**',
            'config/tables/plot/**',
            'config/tables/Tea_houses/**',
            'config/tables/Tea_houses_editable/**',
            'config/tables/Tea_inventory/**',
            'config/tables/Tea_types/**',
            'config/tables/visit/**');

		return dirs;
	};

    grunt.registerTask(
        'adbpush-gatesDemo072216',
        'Push everything for Gates Demo 07-22-16 to the device',
        function() {
            var dirs = gatesDemoFiles072216(grunt);

            // Now push these files to the phone.
            dirs.forEach(infixRenameAdbPusher(".gatesDemo072216", tablesConfig.appDir));
        });


    grunt.registerTask(
        'create-tables-gatesDemo072216',
        'Create the Gates Demo 07-22-2016 application designer package under build/gatesDemo072216/',
        function() {
            var dirs = gatesDemoFiles072216(grunt);

			var buildDir = 'build/gatesDemo072216';

			grunt.file.delete(buildDir + '/');
			grunt.file.mkdir(buildDir);
			grunt.file.mkdir(buildDir + '/' + tablesConfig.appDir);

            // Now push these files to the phone.
            dirs.forEach(infixRenameCopier(".gatesDemo072216", tablesConfig.appDir));

			var otherFiles = grunt.file.expand(
				{filter: 'isFile',
				 cwd: '.' },
				'**',
				'!.git/**',
				'!build/**',
				'!app/**',
				'app/system/**',
				'app/data/tables/geotagger/**',
				'app/output/**');

            otherFiles.forEach(infixRenameCopier(".gatesDemo072216", ""));
        });

	var simpleDemoFiles = function(grunt) {
		// In the alpha demo we want Tables and Survey. For this demo,
		// it had needed a push of the system files, but we won't do that
		// here. We only want a subset of the app/tables files,
		// however. So, we are going to get everything except that
		// directory and then add back in the ones that we want.
		// The first parameter is an options object where we specify that
		// we only want files--this is important because otherwise when
		// we get directory names adb will push everything in the directory
		// name, effectively pushing everything twice.  We also specify that we
		// want everything returned to be relative to 'app' by using 'cwd'.
		var dirs = grunt.file.expand(
			{filter: 'isFile',
			 cwd: 'app' },
			'.nomedia',
			'**',
			'!system/**',
			'!data/**',
			'!output/**',
			'!config/assets/**',
			'!config/tables/**',
			'config/**/*.simpledemo.*',
			'config/assets/framework/forms/framework.simpledemo/**',
			'config/assets/css/odk-survey.css',
			'config/assets/img/advance.png',
			'config/assets/img/backup.png',
			'config/assets/img/form_logo.png',
			'config/assets/img/little_arrow.png',
			'config/assets/img/play.png',
			'config/assets/libs/**',
			'config/assets/ratchet/**',
			'config/assets/css/demo-chooser.css',
			'config/assets/img/spaceNeedle_CCLicense_goCardUSA.jpg',
			'config/assets/js/simpleDemo.js',
			'config/assets/csv/geotagger.updated.csv',
			'config/assets/csv/geotagger/**',
			'config/tables/geotagger/**');

		return dirs;
	};

    grunt.registerTask(
        'adbpush-tables-simpledemo',
        'Push everything for tables opendatakit-simpledemo to the device',
        function() {
            var dirs = simpleDemoFiles(grunt);

            // Now push these files to the phone.
            dirs.forEach(infixRenameAdbPusher(".simpledemo", tablesConfig.appDir));
        });


    grunt.registerTask(
        'create-tables-simpledemo',
        'creat the simpledemo application designer package under build/simpledemo/',
        function() {
            var dirs = simpleDemoFiles(grunt);

			var buildDir = 'build/simpledemo';

			grunt.file.delete(buildDir + '/');
			grunt.file.mkdir(buildDir);
			grunt.file.mkdir(buildDir + '/' + tablesConfig.appDir);

            // Now push these files to the phone.
            dirs.forEach(infixRenameCopier(".simpledemo", tablesConfig.appDir));

			var otherFiles = grunt.file.expand(
				{filter: 'isFile',
				 cwd: '.' },
				'**',
				'!.git/**',
				'!build/**',
				'!app/**',
				'app/system/**',
				'app/data/tables/geotagger/**',
				'app/output/**');

            otherFiles.forEach(infixRenameCopier(".simpledemo", ""));
        });

	var rowLevelAccessDemoFiles = function(grunt) {
		// The row level access demo is based upon the geoweather and
		// geoweather_conditions table.
		var dirs = grunt.file.expand(
			{filter: 'isFile',
			 cwd: 'app' },
			'.nomedia',
			'**',
			'!system/**',
			'!data/**',
			'!output/**',
			'!config/assets/**',
			'!config/tables/**',
			'config/**/*.rowlevelaccessdemo.*',
			'config/assets/changeAccessFilters.html',
			'config/assets/framework/forms/framework.rowlevelaccessdemo/**',
			'config/assets/css/odk-survey.css',
			'config/assets/img/advance.png',
			'config/assets/img/backup.png',
			'config/assets/img/form_logo.png',
			'config/assets/img/little_arrow.png',
			'config/assets/img/play.png',
			'config/assets/libs/**',
			'config/assets/ratchet/**',
			'config/assets/css/demo-chooser.css',
			'config/assets/css/changeAccessFilters.css',
			'config/assets/img/noaa_weather_nssl0010.jpg',
			'config/assets/img/20160902_sky.jpg',
			'config/assets/js/rowLevelAccessDemo.js',
			'config/assets/js/changeAccessFilters.js',
			'config/tables/geoweather_conditions/**',
			'config/tables/geoweather/**',
			'config/assets/csv/geoweather.updated.csv',
			'config/assets/csv/geoweather_conditions.updated.csv');

		return dirs;
	};

    grunt.registerTask(
        'adbpush-tables-rowlevelaccessdemo',
        'Push everything for tables opendatakit-rowlevelaccessdemo to the device',
        function() {
            var dirs = rowLevelAccessDemoFiles(grunt);

            // Now push these files to the phone.
            dirs.forEach(infixRenameAdbPusher(".rowlevelaccessdemo", tablesConfig.appDir));
        });


    grunt.registerTask(
        'create-tables-rowlevelaccessdemo',
        'creat the rowlevelaccessdemo application designer package under build/rowaccessdemo/',
        function() {
            var dirs = rowLevelAccessDemoFiles(grunt);

			var buildDir = 'build/rowlevelaccessdemo';

			grunt.file.delete(buildDir + '/');
			grunt.file.mkdir(buildDir);
			grunt.file.mkdir(buildDir + '/' + tablesConfig.appDir);

            // Now push these files to the phone.
            dirs.forEach(infixRenameCopier(".rowlevelaccessdemo", tablesConfig.appDir));

			var otherFiles = grunt.file.expand(
				{filter: 'isFile',
				 cwd: '.' },
				'**',
				'!.git/**',
				'!build/**',
				'!app/**',
				'app/system/**',
				'app/data/tables/geoweather/**',
				'app/data/tables/geoweather_conditions/**',
				'app/output/**');

            otherFiles.forEach(infixRenameCopier(".rowlevelaccessdemo", ""));
        });

	var georowlevelaccessdemo = function(grunt) {
		// The row level access demo is based upon the geoweather and
		// geoweather_conditions table plus the geotagger demo.
		var dirs = grunt.file.expand(
			{filter: 'isFile',
			 cwd: 'app' },
			'.nomedia',
			'**',
			'!system/**',
			'!data/**',
			'!output/**',
			'!config/assets/**',
			'!config/tables/**',
			'config/**/*.georowlevelaccessdemo.*',
			'config/assets/changeAccessFilters.html',
			'config/assets/framework/forms/framework.georowlevelaccessdemo/**',
			'config/assets/css/odk-survey.css',
			'config/assets/img/advance.png',
			'config/assets/img/backup.png',
			'config/assets/img/form_logo.png',
			'config/assets/img/little_arrow.png',
			'config/assets/img/play.png',
			'config/assets/libs/**',
			'config/assets/ratchet/**',
			'config/assets/css/demo-chooser.css',
			'config/assets/css/changeAccessFilters.css',
			'config/assets/img/noaa_weather_nssl0010.jpg',
			'config/assets/img/20160902_sky.jpg',
			'config/assets/js/georowLevelAccessDemo.js',
			'config/assets/js/changeAccessFilters.js',
			'config/tables/geoweather_conditions/**',
			'config/tables/geoweather/**',
			'config/tables/geotagger/**',
			'config/assets/csv/geoweather.updated.csv',
			'config/assets/csv/geoweather_conditions.updated.csv',
			'config/assets/csv/geotagger.updated.csv',
			'config/assets/csv/geotagger/**');

		return dirs;
	};

    grunt.registerTask(
        'adbpush-tables-georowlevelaccessdemo',
        'Push everything for tables opendatakit-georowlevelaccessdemo to the device',
        function() {
            var dirs = georowlevelaccessdemo(grunt);

            // Now push these files to the phone.
            dirs.forEach(infixRenameAdbPusher(".georowlevelaccessdemo", tablesConfig.appDir));
        });


    grunt.registerTask(
        'create-tables-georowlevelaccessdemo',
        'creat the georowlevelaccessdemo application designer package under build/georowlevelaccessdemo/',
        function() {
            var dirs = georowlevelaccessdemo(grunt);

			var buildDir = 'build/georowlevelaccessdemo';

			grunt.file.delete(buildDir + '/');
			grunt.file.mkdir(buildDir);
			grunt.file.mkdir(buildDir + '/' + tablesConfig.appDir);

            // Now push these files to the phone.
            dirs.forEach(infixRenameCopier(".georowlevelaccessdemo", tablesConfig.appDir));

			var otherFiles = grunt.file.expand(
				{filter: 'isFile',
				 cwd: '.' },
				'**',
				'!.git/**',
				'!build/**',
				'!app/**',
				'app/system/**',
				'app/data/tables/geotagger/**',
				'app/data/tables/geoweather/**',
				'app/data/tables/geoweather_conditions/**',
				'app/output/**');

            otherFiles.forEach(infixRenameCopier(".georowlevelaccessdemo", ""));
        });

	var tablesDemoFiles = function(grunt) {
		// In the alpha demo we want Tables and Survey. For this demo,
		// it had needed a push of the system files, but we won't do that
		// here. We only want a subset of the app/tables files,
		// however. So, we are going to get everything except that
		// directory and then add back in the ones that we want.
		// The first parameter is an options object where we specify that
		// we only want files--this is important because otherwise when
		// we get directory names adb will push everything in the directory
		// name, effectively pushing everything twice.  We also specify that we
		// want everything returned to be relative to 'app' by using 'cwd'.
		var dirs = grunt.file.expand(
			{filter: 'isFile',
			 cwd: 'app' },
			'.nomedia',
			'**',
			'!system/**',
			'!data/**',
			'!output/**',
			'!config/assets/**',
			'!config/tables/**',
			'config/**/*.tablesdemo.*',
			'config/assets/framework/forms/framework.tablesdemo/**',
			'config/assets/css/odk-survey.css',
			'config/assets/img/advance.png',
			'config/assets/img/backup.png',
			'config/assets/img/form_logo.png',
			'config/assets/img/little_arrow.png',
			'config/assets/img/play.png',
			'config/assets/libs/**',
			'config/assets/fonts/**',

			// demo chooser index page...
			'config/assets/index.html',
			'config/assets/js/demoChooser.js',
			'config/assets/css/demo-chooser.css',
			'config/assets/img/teaBackground.jpg',
			'config/assets/img/hopePic.JPG',
			'config/assets/img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg',
			'config/assets/img/spaceNeedle_CCLicense_goCardUSA.jpg',
			'config/assets/img/chimp.png',
			'config/assets/tables.init',

			// hope study example
			'config/assets/css/hope-homescreen.css',
			'config/assets/hope.html',
			// referenced within table html files
			'config/assets/css/clients_list.css',
			// MISSING: 'config/assets/clients_not_found_list.html',
			'config/assets/img/little_arrow.png',
			'config/assets/css/geopoints_list.css',
			'config/assets/css/clients_detail.css',

			'config/assets/csv/femaleClients.allfields.csv',
			'config/tables/femaleClients/**',
			'config/assets/csv/maleClients.allfields.csv',
			'config/tables/maleClients/**',
			'config/assets/csv/geopoints.allfields.csv',
			'config/tables/geopoints/**',

			// jgi example
			// config/assets/ratchet/**
			// config/assets/js/bootstrap.js
			// config/assets/js/ratchet.js
			'config/assets/jgiIndex.html',
			'config/assets/js/jgiHomeScreen.js',
			'config/assets/js/jgiFollowScreen.js',
			'config/assets/css/gatesHomeScreen.css',
			'config/assets/newFollow.html',
			'config/assets/css/jgi-follow.css',
			'config/assets/followScreen.html',
			'config/assets/img/chimp.png',
			'config/assets/img/little_arrow.png',
			'config/assets/js/jgiNewFollow.js',
			'config/assets/js/util.js',

			'config/assets/csv/follow.updated.csv',
			'config/tables/follow/**',
			'config/tables/follow_arrival/**',
			'config/tables/follow_map_position/**',
			'config/tables/follow_map_time/**',
			'config/tables/food_bout/**',
			'config/tables/groom_bout/**',
			'config/tables/mating_event/**',
			'config/tables/other_species/**',

			// geotagger example
			'config/assets/csv/geotagger.updated.csv',
			'config/assets/csv/geotagger/**',
			'config/tables/geotagger/**',

			// plot example
			// config/assets/ratchet/**
			'config/assets/css/homeScreen.css',
			'config/assets/css/plot-homescreen.css',
			'config/assets/css/plot-list.css',
			'config/assets/css/plot-detail.css',
			'config/assets/css/plot-graph.css',
			'config/assets/css/plot-report.css',
			'config/assets/css/plot-view.css',
			'config/assets/css/visit-list.css',
			'config/assets/css/visit-detail.css',
			'config/assets/plotter.html',
			'config/assets/plotter-*.html',
			'config/assets/js/util.js',
			'config/assets/js/plotter-*.js',
			'config/assets/img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg',
			'config/assets/csv/plot.example.csv',
			'config/tables/plot/**',
			'config/assets/csv/visit.example.csv',
			'config/tables/visit/**',

			// teatime example
			// config/assets/ratchet/**
			'config/assets/css/homeScreen.css',
			'config/assets/css/detail.css',
			'config/assets/css/list.css',
			'config/assets/teatime.html',
			'config/assets/js/teatime.js',
			'config/assets/img/teaBackground.jpg',
			'config/assets/csv/Tea_houses.updated.csv',
			'config/tables/Tea_houses/**',
			'config/assets/csv/Tea_inventory.updated.csv',
			'config/tables/Tea_inventory/**',
			'config/assets/csv/Tea_types.updated.csv',
			'config/tables/Tea_types/**',
			'config/assets/csv/Tea_houses_editable.updated.csv',
			'config/tables/Tea_houses_editable/**'
			);

		return dirs;
	};

    grunt.registerTask(
        'adbpush-tables-tablesdemo',
        'Push everything for tables opendatakit-tablesdemo to the device',
        function() {
            var dirs = tablesDemoFiles(grunt);

			dirs.forEach(infixRenameAdbPusher(".tablesdemo", tablesConfig.appDir));
        });

    grunt.registerTask(
        'create-tables-tablesdemo',
        'creat the tablesdemo application designer package under build/tablesdemo/',
        function() {
            var dirs = tablesDemoFiles(grunt);

			var buildDir = 'build/tablesdemo';

			grunt.file.delete(buildDir + '/');
			grunt.file.mkdir(buildDir);
			grunt.file.mkdir(buildDir + '/' + tablesConfig.appDir);

            // Now push these files to the phone.
            dirs.forEach(infixRenameCopier(".tablesdemo", tablesConfig.appDir));

			var otherFiles = grunt.file.expand(
				{filter: 'isFile',
				 cwd: '.' },
				'**',
				'!.git/**',
				'!build/**',
				'!app/**',
				'app/system/**',
				'app/data/tables/geotagger/**',
				'app/output/**');

            otherFiles.forEach(infixRenameCopier(".tablesdemo", ""));
        });

	var opendatakit2DemoFiles = function(grunt) {
		// This only pushes the definitions of the opendatakit-2.appspot.com forms.
		var dirs = grunt.file.expand(
			{filter: 'isFile',
			 cwd: 'app' },
			'.nomedia',
			'**',
			'!system/**',
			'!data/**',
			'!output/**',
			'!config/assets/**',
			'!config/tables/**',
			'config/**/*.opendatakit-2.*',
			'config/assets/framework/forms/framework.opendatakit-2/**',
			'config/assets/css/odk-survey.css',
			'config/assets/img/advance.png',
			'config/assets/img/backup.png',
			'config/assets/img/form_logo.png',
			'config/assets/img/little_arrow.png',
			'config/assets/img/play.png',
			'config/assets/libs/**',
			'config/tables/exampleForm/**',
			'config/tables/household/**',
			'config/tables/household_member/**',
			'config/tables/selects/**',
			'config/tables/gridScreen/**');

		return dirs;
	};

    grunt.registerTask(
        'adbpush-tables-opendatakit-2',
        'Push everything for survey opendatakit-2 site to the device',
        function() {
            var dirs = opendatakit2DemoFiles(grunt);

			dirs.forEach(infixRenameAdbPusher(".opendatakit-2", tablesConfig.appDir));
        });

    grunt.registerTask(
        'create-tables-opendatakit-2',
        'create the opendatakit-2 application designer package under build/opendatakit-2/',
        function() {
            var dirs = opendatakit2DemoFiles(grunt);

			var buildDir = 'build/opendatakit-2';

			grunt.file.delete(buildDir + '/');
			grunt.file.mkdir(buildDir);
			grunt.file.mkdir(buildDir + '/' + tablesConfig.appDir);

            // Now push these files to the phone.
            dirs.forEach(infixRenameCopier(".opendatakit-2", tablesConfig.appDir));

			var otherFiles = grunt.file.expand(
				{filter: 'isFile',
				 cwd: '.' },
				'**',
				'!.git/**',
				'!build/**',
				'!app/**',
				'app/system/**',
				'app/output/**');

            otherFiles.forEach(infixRenameCopier(".opendatakit-2", ""));
        });

    grunt.registerTask(
        'adbpush-survey',
        'Push everything for survey to the device',
        function() {
            // We do not need any system or output files.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
				'!data/**',
                '!output/**',
                '!**/~$*.xlsx');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = surveyConfig.appDir + '/' + fileName;
                var dest =
                    surveyConfig.deviceMount +
                    '/' +
                    surveyConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        'adbpush-survey-demo-beta2',
        'Push everything for survey to the device',
        function() {
            // In the beta demo we only want Survey; do not push any
			// system or output files. We only want a subset of the
			// app/config/tables files. So, we are going to get everything except
            // that directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
				'!data/**',
				'!output/**',
                '!config/tables/**',
                'config/tables/exampleForm/**',
                'config/tables/household/**',
                'config/tables/household_member/**',
                'config/tables/selects/**',
                'config/tables/gridScreen/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = surveyConfig.appDir + '/' + fileName;
                var dest =
                    surveyConfig.deviceMount +
                    '/' +
                    surveyConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        'adbpush-survey-demo-bmg05152014',
        'Push everything for survey demo to the device',
        function() {
            // In the demo we only want Survey. Do not push the system or
			// output files.  We only want a subset of the app/config/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
				'!data/**',
				'!output/**',
                '!config/tables/**',
                'config/tables/household/**',
                'config/tables/household_member/**',
                'config/tables/selects/**',
                'config/tables/gridScreen/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = surveyConfig.appDir + '/' + fileName;
                var dest =
                    surveyConfig.deviceMount +
                    '/' +
                    surveyConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        'adbpush-survey-demo-bmg10092014',
        'Push everything for survey demo to the device',
        function() {
            // In the demo we only want Survey. Do not push the system or
			// output files. We only want a subset of the app/config/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            //
            // For this demo selects had to be modified due to select_one_with_other
            // and the media player not working for video
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
				'!system/**',
				'!data/**',
				'!output/**',
                '!config/assets/**',
                'config/assets/csv/**',
                'config/assets/tables.init',
                '!config/tables/**',
                'config/tables/plot/**',
                'config/tables/visit/**',
                'config/tables/selects_demo/**',
                'config/tables/geotagger/**',
                'config/tables/agriculture/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        'adbpush-survey-demo-techCon2014',
        'Push everything for survey demo to the device',
        function() {
            // In the demo we only want Survey. Do not push the system or
			// output files. We only want a subset of the app/config/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            //
            // For this demo selects had to be modified due to select_one_with_other
            // and the media player not working for video
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
				'!data/**',
                '!output/**',
                '!config/assets/**',
                'config/assets/csv/**',
                'config/assets/tables.init',
                '!config/tables/**',
                'config/tables/plot/**',
                'config/tables/visit/**',
                'config/tables/selects_demo/**',
                'config/tables/geotagger/**',
                'config/tables/agriculture/**',
                'config/tables/temperatureSensor/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = tablesConfig.appDir + '/' + fileName;
                var dest =
                    tablesConfig.deviceMount +
                    '/' +
                    tablesConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        'adbpush-survey-demo-beta3',
        'Push everything for survey to the device',
        function() {
            // In the beta demo we only want Survey. Do not push the system
			// or output files. We only want a subset of the app/config/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!system/**',
				'!data/**',
                '!output/**',
                '!config/assets/**',
                '!config/tables/**',
                'config/tables/exampleForm/**',
                'config/tables/household/**',
                'config/tables/household_member/**',
                'config/tables/selects/**',
                'config/tables/gridScreen/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = surveyConfig.appDir + '/' + fileName;
                var dest =
                    surveyConfig.deviceMount +
                    '/' +
                    surveyConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });


    grunt.registerTask(
        'adbpush-survey-beta3-opendatakit-surveydemo',
        'Push everything for the opendatakit-surveydemo.appspot.com site to the device',
        function() {
            // These are the files that are uploaded to the opendatakit-surveydemo
			// appspot instance. We only want a subset of the app/tables files,
            // however. So, we are going to get everything except that
            // directory and then add back in the ones that we want.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
				'.nomedia',
                '**',
                '!config/assets/**',
                '!system/**',
				'!data/**',
                '!output/**',
                '!config/tables/**',
                'config/tables/geoweather/**');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = surveyConfig.appDir + '/' + fileName;
                var dest =
                    surveyConfig.deviceMount +
                    '/' +
                    surveyConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        'adbpush-collect',
        'Push any collect form to the device',
        function() {
            // The full paths to all the table id directories.
            var tableIdDirs = grunt.file.expand(tablesConfig.tablesDir + '/*');
            // Now we want just the table ids.
            var tableIds = [];
            var COLLECT_FORMS = "collect-forms";
            tableIdDirs.forEach(function(element) {
                tableIds.push(element.substr(element.lastIndexOf('/') + 1));
            });
            grunt.log.writeln(this.name + ', found tableIds: ' + tableIds);
            // Now that we have the table ids, we need to push any form in the
			// collect-forms directory. There should be only one, but we aren't
			// picky.
            tableIds.forEach(function(tableId) {
                var files = grunt.file.expand(
                    tablesConfig.tablesDir + '/' + tableId +
                    '/' + COLLECT_FORMS + '/*',
                    '!' + tablesConfig.tablesDir + '/' + tableId +
                    '/' + COLLECT_FORMS + '/~$*.xlsx');
                files.forEach(function(file) {
                    var src = file;
                    // We basically want to push all the contents under
                    // /sdcard/opendatakit/APP/tables/tableId/collect-forms
					// to /sdcard/odk/forms
					// I.e., this folder should contain things like:
					//  .../formid.xml
					//  .../formid-media/form_logo.jpg
					//  .../formid-media/...
					//  .../formid2.xml
					//
                    // The names of the files will stay the same
				    // when we push them
                    var destPos = src.indexOf(COLLECT_FORMS);
                    destPos = destPos + COLLECT_FORMS.length;
                    var destPath = src.substr(destPos);
                    var dest = tablesConfig.formMount + destPath;
                    grunt.log.writeln(
                        'adb push ' + src + ' ' + dest);
                    grunt.task.run('exec:adbpush: ' + src + ':' + dest);
                });
            });
        });

    // This task adds a table. This includes making a folder in the app/tables
    // directory and instantiating the directory structure that is expected.
    // It also creates templates for the js and html files based on the given
    // tableId.
    grunt.registerTask(
        'addtable',
        'Adds a table directory structure',
        function(tableId) {
            if (arguments.length !== 1) {
                grunt.fail.fatal(this.name +
                ' requires one tableId. Call using "' +
                this.name + ':tableId"');
            } else {

                /**
                 * Reads the file in srcPath, replaces all instances of
                 * tablesConfig.tableIdStr with tableId, and writes it to
                 * destPath.
                 */
                var replaceIdAndWrite = function(srcPath, destPath, tableId) {
                    var contents = grunt.file.read(srcPath);
                    // Now modify it.
                    // We need to do a global replace.
                    var regex = new RegExp(tablesConfig.tableIdStr, 'g');
                    contents =
                        contents.replace(regex, tableId);
                    grunt.file.write(destPath, contents);
                };

                grunt.log.writeln(
                    this.name + ' making table with id ' + tableId);
                var tableDir = tablesConfig.tablesDir + '/' + tableId;
                // First we need to make the directory in the tables dir.
                grunt.file.mkdir(tableDir);
                // Now we copy the files from the grunttemplates directory into
                // the new directory. We're going to do the files that depend
                // on the tableId independntly, doing a string replace on our
                // flag for the marker.
                // These will be the files in the tableTemplateDir we want to
                // copy directly. You must terminate with / if it is a dir.
                var toCopy = [
                    'forms/',
                    'collect-forms/',
                    'instances/'
                ];
                grunt.log.writeln(this.name + ', copying files: ' + toCopy);
                toCopy.forEach(function(path) {
                    var srcPath = tablesConfig.tableTemplateDir + '/' + path;
                    var destPath = tableDir + '/' + path;
                    // We have to do a special case on if it's a directory.
                    if (grunt.util._.endsWith(srcPath, '/')) {
                        grunt.file.mkdir(destPath);
                    } else {
                        grunt.file.copy(srcPath, destPath);
                    }
                });
                // Now we will copy the files to which we need to add the
                // table id.
                var detailHtml = {
                    srcPath: tablesConfig.tableTemplateDir +
                        '/html/detail.html',
                    destPath: tableDir + '/html/' + tableId + '_detail.html'
                };
                var detailJs = {
                    srcPath: tablesConfig.tableTemplateDir + '/js/detail.js',
                    destPath: tableDir + '/js/' + tableId + '_detail.js'
                };
                var listHtml = {
                    srcPath: tablesConfig.tableTemplateDir + '/html/list.html',
                    destPath: tableDir + '/html/' + tableId + '_list.html'
                };
                var listJs = {
                    srcPath: tablesConfig.tableTemplateDir + '/js/list.js',
                    destPath: tableDir + '/js/' + tableId + '_list.js'
                };
                var filesToReplace = [
                    detailHtml,
                    detailJs,
                    listHtml,
                    listJs
                ];
                grunt.log.writeln(this.name + ', writing dynamic table files');
                filesToReplace.forEach(function(element) {
                    replaceIdAndWrite(
                        element.srcPath,
                        element.destPath,
                        tableId);
                });
            }

        });

    grunt.registerTask('server', function (target) {

        if (target === 'test') {
            return grunt.task.run([
                'connect:test',
                'watch:livereload'
            ]);
        }

        grunt.task.run([
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('default', [
        'server'
    ]);

    grunt.registerTask(
        'adbpush-system',
        'Push the system directory to the survey appName on the device',
        function() {
            // Useful for testing working system code before constructing
			// the framework zip file and adding it to the APK res/raw
			// folder.
            // The first parameter is an options object where we specify that
            // we only want files--this is important because otherwise when
            // we get directory names adb will push everything in the directory
            // name, effectively pushing everything twice.  We also specify that we
            // want everything returned to be relative to 'app' by using 'cwd'.
            var dirs = grunt.file.expand(
                {filter: 'isFile',
                 cwd: 'app' },
                'system/**',
                '!**/~$*.xlsx');

            // Now push these files to the phone.
            dirs.forEach(function(fileName) {
                //  Have to add app back into the file name for the adb push
                var src = surveyConfig.appDir + '/' + fileName;
                var dest =
                    surveyConfig.deviceMount +
                    '/' +
                    surveyConfig.appName +
                    '/' +
                    fileName;
                grunt.log.writeln('adb push ' + src + ' ' + dest);
                grunt.task.run('exec:adbpush:' + src + ':' + dest);
            });

        });

    grunt.registerTask(
        "killall",
        "Force stops survey, tables and services",
        function killall() {
            var apps = ["survey", "tables", "services"];
            for (var i = 0; i < apps.length; i++) {
                console.log("Force stopping ".concat(apps[i]));
                grunt.task.run("exec:adbshell:am force-stop org.opendatakit.".concat(apps[i]));
            }
        });

    grunt.registerTask(
        "uninstall",
        "Uninstalls ODK tools",
        function remove_folders() {
            grunt.task.run("remove-folders");
            var apps = ["core", "services", "survey.android", "survey", "tables"];
            for (var i = 0; i < apps.length; i++) {
                console.log("Uninstalling ".concat(apps[i]));
                grunt.task.run("exec:adbshell:pm uninstall org.opendatakit.".concat(apps[i]));
            }
        });
    grunt.registerTask(
        "remove-folders",
        "Removes the opendatakit folders",
        function remove_folders() {
            grunt.task.run("killall");
            var folders = [tablesConfig.deviceMount + "/" + tablesConfig.appName];//, "/sdcard/odk"];
            for (var i = 0; i < folders.length; i++) {
                console.log("Deleting ".concat(folders[i]));
                grunt.task.run("exec:adbshell:rm -rf ".concat(folders[i]));
            }

        });
    grunt.registerTask(
        "adbpull-props",
        "Copies the properties from the device",
        function props() {
            var base = tablesConfig.deviceMount.concat("/", tablesConfig.appName);
            var destbase = tablesConfig.appDir.concat("/", tablesConfig.outputPropsDir, "/");
            var files = ["/config/assets/app.properties", "/data/device.properties"];
            grunt.task.run("force:on")
            for (var i = 0; i < files.length; i++) {
                grunt.task.run("exec:adbpull:".concat(base, files[i], ":", destbase, basename(files[i])));
            }
            grunt.task.run("adbpull-fixprops")
            grunt.task.run("force:restore")
        });
    grunt.registerTask(
        "adbpull-fixprops",
        "Removes init strings from device.properties",
        function props() {
            var file = tablesConfig.appDir.concat("/", tablesConfig.outputPropsDir, "/device.properties");
            var props = grunt.file.read(file).split("\n");
            for (var i = 0; i < props.length; i++) {
                if (props[i].indexOf("tool_last_initialization_start_time") >= 0) {
                    props[i] = "";
                }
            }
            grunt.file.write(file, props.join("\n"));
        });
    grunt.registerTask(
        "adbpush-props",
        "Copies the properties to the device",
        function props() {
            var base = tablesConfig.deviceMount.concat("/", tablesConfig.appName);
            var destbase = tablesConfig.appDir.concat("/", tablesConfig.outputPropsDir, "/");
            var files = ["/config/assets/app.properties", "/data/device.properties"];
            grunt.task.run("force:on")
            for (var i = 0; i < files.length; i++) {
                grunt.task.run("exec:adbpush:".concat(destbase, basename(files[i]), ":", base, files[i]));
            }
            grunt.task.run("force:restore")
        });
    var basename = function basename(path) {
        var idx = path.lastIndexOf("/");
        if (path.length != idx + 1) {
            return path.substr(idx + 1);
        } else {
            return basename(path.substr(0, idx))
        }
    }
    grunt.registerTask(
        "setup",
        "Launch the login and sync screen",
        function() {
            grunt.task.run("exec:adbshell:am start -a android.intent.action.MAIN -n org.opendatakit.services/.sync.actions.activities.SyncActivity --es appName "+tablesConfig.appName+" --es showLogin true");
        }
    )
    // https://stackoverflow.com/questions/16612495/continue-certain-tasks-in-grunt-even-if-one-fails
    var previous_force_state = grunt.option("force");
    grunt.registerTask("force",function(set){
        if (set === "on") grunt.option("force", true);
        if (set === "off") grunt.option("force", false);
        if (set === "restore") grunt.option("force", previous_force_state);
    });

    function deleteFilesList(grunt, workingDir, toBeDeleted) {
        toBeDeleted.forEach(function (fileName) {
            var dirToUse = workingDir;
            if (!dirToUse.endsWith('/')) {
                dirToUse = dirToUse + '/';
            }

            var src = dirToUse + fileName;
            grunt.log.writeln('deleteTopLevel: deleting ' + src);
            grunt.file.delete(src, {force: true});
        });
    }

    var deleteTopLevel = function(grunt, dirToDelete) {
        var toBeDeleted = grunt.file.expand(
            {cwd: dirToDelete },
            '*');
        deleteFilesList(grunt, dirToDelete, toBeDeleted);
    };

    grunt.registerTask(
        'empty',
        'Remove unnecessary files to make an empty app-designer',
        function() {

            deleteTopLevel(grunt, tablesConfig.tablesDir);
            deleteTopLevel(grunt, tablesConfig.assetsDir + '/csv');
            deleteTopLevel(grunt, tablesConfig.dataDir);
            deleteTopLevel(grunt, tablesConfig.appDir + '/' + tablesConfig.outputCsvDir);
            deleteTopLevel(grunt, tablesConfig.appDir + '/' + tablesConfig.outputDbDir);
            deleteTopLevel(grunt, tablesConfig.appDir + '/' + tablesConfig.outputDebugDir);
            deleteTopLevel(grunt, tablesConfig.appDir + '/' + tablesConfig.outputPropsDir);

            var assetFilesToDelete = grunt.file.expand(
                {filter: 'isFile',
                    cwd: tablesConfig.assetsDir },
                '*.*',
                '!favicon.ico',
                'css/**',
                '!css/odk-survey.css',
                'csv/**',
                'framework/**',
                '!**/*.clean.*',
                '!framework/forms/framework.clean/**',
                'img/**',
                '!img/play.png',
                '!img/form_logo.png',
                '!img/backup.png',
                '!img/advance.png',
                '!img/little_arrow.png',
                'js/**',
                '!js/util.js',
                '!libs/**',
                '!commonDefinitions.js',
                '!index.html',
                '!framework/forms/framework/formDef.json',
                '!framework/forms/framework/framework.xlsx',
                '!framework/frameworkDefinitions.js'
            );

            // Delete unnecessary files
            deleteFilesList(grunt, tablesConfig.assetsDir, assetFilesToDelete);

            // Find all instances of things with .clean in it
            var cleanFilesToDelete = grunt.file.expand(
                { cwd: tablesConfig.assetsDir,
                    filter: 'isFile'},
                '**/*.clean.*',
                '**/*.clean/**'
            );

            // Copy *.clean files over to the correct directory
            cleanFilesToDelete.forEach(function(fileName) {
                var src = tablesConfig.assetsDir + '/' + fileName;
                var dest = src;
                var dest = dest.replace(new RegExp('.clean', 'g'), '');
                grunt.log.writeln('copy ' + src + ' to ' + dest);
                grunt.file.copy(src, dest);
            });

            // Delete all of the .clean files now
            deleteFilesList(grunt, tablesConfig.assetsDir, cleanFilesToDelete);

            // Delete all of the other framework directories
            var assetsDirToDelete = grunt.file.expand(
                {cwd: tablesConfig.assetsDir + '/framework/forms'},
                '*',
                '*.*',
                '!framework/**');

            deleteFilesList(grunt, tablesConfig.assetsDir + '/framework/forms', assetsDirToDelete);
        });
};
