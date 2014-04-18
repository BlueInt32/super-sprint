module.exports = function (grunt)
{

	require('load-grunt-tasks')(grunt);
	// Project configuration.
	grunt.initConfig(
	{
		jshint:
		{
			all:
			[
				'!js/libs/box2dweb/Box2dWeb-2.1.a.3.js',
				'!js/libs/pixi.js/pixi.dev.js',
				'!js/libs/Stats.js',
				'!js/libs/dat.gui.min.js',
				'js/libs/loadrube.js',
				'js/KeyboardHandler.js',
				'js/utils/b2.js',
				'js/utils/LinkedList.js',
				'js/b2Universe.js',
				'js/RubeFilesLoader.js',
				'js/CheckpointManager.js',
				'js/conf/Consts.js',
				'js/conf/Cars.js',
				'js/conf/Tracks.js',
				'js/Main.js',
				'js/Car.js',
				'js/utils/MathUtil.js',
				'!publish/min.js'
			]
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
						'js/KeyboardHandler.js',
						'js/utils/b2.js',
						'js/utils/LinkedList.js',
						'js/b2Universe.js',
						'js/RubeFilesLoader.js',
						'js/conf/Consts.js',
						'js/conf/Cars.js',
						'js/conf/Tracks.js',
						'js/CheckpointManager.js',
						'js/Main.js',
						'js/Car.js',
						'js/libs/Stats.js',
						'js/utils/MathUtil.js',
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
					{expand: true, src: ['assets/**'], dest: 'publish/'},
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
		    dist: {
				files: {
					'publish/index.html': ['index.html']
				}
		    }
		}
	});


	grunt.registerTask('default', ['jshint', 'uglify:dist', 'copy', 'processhtml']);
};