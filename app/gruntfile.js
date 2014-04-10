module.exports = function (grunt)
{

	require('load-grunt-tasks')(grunt);
	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: ['app.js', 'directives.js', 'services/gameService.js', '!min.js']
		},
		uglify: {
			dist: {
				files: {
					'js/min.js' : [
							'js/libs/box2dweb/Box2dWeb-2.1.a.3.js',
							'js/libs/pixi.js/pixi.dev.js',
							'js/KeyboardHandler.js',
							'js/Sprites.js',
							'js/utils/b2.js',
							'js/b2Helper.js',
							'js/utils/Consts.js',
							'js/Main.js',
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
					'../Content/css/min.css': ['../Content/css/styles.css']
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
		}

	});


	grunt.registerTask('default', ['jshint', 'karma', 'uglify:dist', 'cssmin', 'imagemin']);
};