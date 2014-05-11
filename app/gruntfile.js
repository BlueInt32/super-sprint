module.exports = function (grunt)
{
	require('load-grunt-tasks')(grunt);
	// Project configuration.
	grunt.initConfig(
	{
		jshint:
		{
			ignore_warning:
			{
				options:
				{
					'-W041': true
				},
				src: ['!js/libs/box2dweb/Box2dWeb-2.1.a.3.js',
				'!js/libs/pixi.js/pixi.dev.js',
				'!js/libs/Stats.js',
				'!js/libs/dat.gui.min.js',
				'js/libs/loadrube.js',
				'js/compiled/keyboardHandler.js',
				'js/compiled/b2Helpers.js',
				'js/compiled/linkedList.js',
				'js/compiled/universe.js',
				'js/compiled/worldSetup.js',
				'js/compiled/checkpointManager.js',
				'js/compiled/consts.js',
				'js/compiled/carsConfig.js',
				'js/compiled/tracksConfig.js',
				'js/compiled/game.js',
				'js/compiled/car.js',
				'!publish/min.js']
			},
		},
		uglify:
		{
			dist:
			{
				files:
				{
					'publish/js/min.js' :
					[
						'js/libs/box2dweb/Box2dWeb-2.1.a.3.js',
						'js/libs/pixi.js/pixi.dev.js',
						'js/libs/loadrube.js',
						'js/libs/dat.gui.min.js',
						'js/compiled/keyboardHandler.js',
						'js/compiled/b2Helpers.js',
						'js/compiled/linkedList.js',
						'js/compiled/universe.js',
						'js/compiled/worldSetup.js',
						'js/compiled/checkpointManager.js',
						'js/compiled/consts.js',
						'js/compiled/carsConfig.js',
						'js/compiled/tracksConfig.js',
						'js/compiled/game.js',
						'js/compiled/car.js'
					]
				}
			}
		},
		cssmin:
		{
			combine:
			{
				files:
				{
					'publish/css/min.css': ['css/style.css']
				}
			}
		},
		copy:
		{
			main:
			{
				files:
				[
					// includes files within path
					//{expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},

					// includes files within path and its sub-directories
					//{expand: true, src: ['path/**'], dest: 'dest/'},
					{
						expand: true,
						src: ['assets/**',"!**/*.lnk", "!**/*.rube", "!**/*rube-backups/**", "!**/*.log"],
						dest: 'publish/',
						options:
						{
							process: function (content, srcpath)
							{
								console.log(srcpath);
								if(srcpath === "min.js")
									return content.replace(".json",".js");
							}
						},
						rename: function(dest, src) // rename .json files to .js because OVH...
						{
							if(src.indexOf('.json') === -1)
							{

								return dest+'/'+src;
							}
							return dest +  src.replace(".json", ".js");
						}
        			},
					// {expand: true, src: ['assets/**'], dest: 'publish/'},

					// makes all src relative to cwd
					//{expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},

					// flattens results to a single level
					{expand: true, src: ['css/style.css'], dest: 'publish/', filter: 'isFile'}
				]
			}
		},
		processhtml:
		{
			options:
			{
				data:
				{
		        	message: 'Hello world!'
				}
		    },
		    dist:
		    {
				files:
				{
					'publish/index.html': ['index.html']
				}
		    }
		},
		replace:
		{
			example:
			{
				src: ['publish/js/min.js'],             // source files array (supports minimatch)
				overwrite: true,
				replacements:
				[
					{
						from: /([a-zA-Z0-9]+)\.json"/g,                   // string replacement
						//to: '$1.js"',
						to: function (matchedWord, index, fullText, regexMatches)
						{
							console.log(matchedWord);
							// matchedWord:  "world"
							// index:  6
							// fullText:  "Hello world"
							// regexMatches:  ["ld"]
							return regexMatches[0] + '.js"';   //
						}
					}
				]
			}
		},
		coffee:
		{
			compile:
			{
				options:
				{
					bare: true
				},
				files:
				{
					'js/compiled/car.js': ['js/car.coffee'],
					'js/compiled/universe.js': ['js/universe.coffee'],
					'js/compiled/checkpointManager.js': ['js/checkpointManager.coffee'],
					'js/compiled/contactManager.js': ['js/contactManager.coffee'],
					'js/compiled/keyboardHandler.js': ['js/keyboardHandler.coffee'],
					'js/compiled/worldSetup.js': ['js/worldSetup.coffee'],
					'js/compiled/game.js': ['js/game.coffee'],
					'js/compiled/b2Helpers.js': ['js/utils/b2Helpers.coffee'],
					'js/compiled/linkedList.js': ['js/utils/linkedList.coffee'],
					'js/compiled/carsConfig.js': ['js/conf/carsConfig.coffee'],
					'js/compiled/tracksConfig.js': ['js/conf/tracksConfig.coffee'],
					'js/compiled/consts.js': ['js/conf/consts.coffee']
				}
			}
		},
		watch:
		{
			coffee:
			{
				files: ['js/**/*.coffee'],
				tasks: 'coffee'
			}
		}
	});


	grunt.registerTask('default', ['coffee', 'jshint', 'uglify:dist', 'copy', 'processhtml', 'replace']);
	grunt.registerTask('wCoffee', ['watch:coffee']);
};