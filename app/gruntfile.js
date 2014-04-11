module.exports = function (grunt)
{

	require('load-grunt-tasks')(grunt);
	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
							'!js/libs/box2dweb/Box2dWeb-2.1.a.3.js',
							'!js/libs/pixi.js/pixi.dev.js',
							'!js/libs/Stats.js',
							'js/KeyboardHandler.js',
							'js/Sprites.js',
							'js/utils/b2.js',
							'js/b2Universe.js',
							'js/utils/Consts.js',
							'js/Main.js',
							'js/conf/Cars.js',
							'js/Car.js',
							'js/utils/MathUtil.js',
							'!publish/min.js']
		},
		uglify: {
			dist: {
				files: {
					'publish/js/min.js' : [
							'js/libs/box2dweb/Box2dWeb-2.1.a.3.js',
							'js/libs/pixi.js/pixi.dev.js',
							'js/KeyboardHandler.js',
							'js/Sprites.js',
							'js/utils/b2.js',
							'js/b2Universe.js',
							'js/utils/Consts.js',
							'js/Main.js',
							'js/conf/Cars.js',
							'js/Car.js',
							'js/libs/Stats.js',
							'js/utils/MathUtil.js',
						]
				}
			}
		},
		cssmin: {
			combine: {
				files: {
					'publish/css/min.css': ['css/style.css']
				}
			}
		},
		watch: {
			js: {
				files: ['**/*.js', '!**/*min.*'],
				tasks: ['jshint', 'uglify'],
				options: { spawn: false}
			},
			min: {
				files: ['../Content/css/**/*.css', '!../Content/css/min.css'],
				tasks: ['cssmin']
			}
		},
		imagemin: {
			dynamic: {                         // Another target
				files: [{
					expand: true,                  // Enable dynamic expansion
					cwd: '../Content/images/elements/',                   // Src matches are relative to this path
					src: ['*.{png,gif}'],   // Actual patterns to match
					dest: '../Content/images/elements/min',// Destination path prefix
				}]
			},
			options: { spawn: false }
		},

		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},

		copy: {
			main: {
				files: [
				// includes files within path
				//{expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},

				// includes files within path and its sub-directories
				//{expand: true, src: ['path/**'], dest: 'dest/'},
				{expand: true, src: ['images/**'], dest: 'publish/images/'},
				{expand: true, src: ['index.html'], dest: 'publish/', filter: 'isFile'},

				// makes all src relative to cwd
				//{expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},

				// flattens results to a single level
				//{expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'}
				]
			}
		}

	});


	grunt.registerTask('default', ['jshint', 'uglify:dist', 'cssmin', 'copy']);
};