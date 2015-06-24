var path = require('path');

var stylesheetsDir = 'assets/stylesheets';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    less: {
      compile: {
        options: {
          paths: [stylesheetsDir]
        },
        files: {
          'public/styles.css': stylesheetsDir + '/index.less'
        }
      }
    },

    watch: {
      scripts: {
        files: 'app/**/*.js',
        tasks: ['browserify'],
        options: {
          interrupt: true
        }
      },
      stylesheets: {
        files: [
          stylesheetsDir + '/**/*.less', 
          stylesheetsDir + '/**/*.css'
        ],
        tasks: ['less'],
        options: {
          interrupt: true
        }
      }
    },

    browserify: {
      options: {
        debug: true,
        aliasMappings: [
          {
            cwd: 'app',
            src: ['client/*.js', 'shared/*.js'],
            dest: 'app'
          }
        ],
        shim: {
          jquery: {
            path: 'node_modules/jquery/dist/jquery.js',
            exports: '$'
          },
          bootstrap: {
            path: 'node_modules/bootstrap/dist/js/bootstrap.js',
            exports: null,
            depends: { 
              jquery: '$' 
            }
          }
        }
      },
      app: {
        src: [ 'app/**/*.js' ],
        dest: 'public/application.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('runNode', function () {
    grunt.util.spawn({
      cmd: 'node',
      args: ['./node_modules/nodemon/nodemon.js', 'index.js'],
      opts: {
        stdio: 'inherit'
      }
    }, function () {
      grunt.fail.fatal(new Error("nodemon quit"));
    });
  });


  grunt.registerTask('compile', ['browserify', 'less']);

  // Run the server and watch for file changes
  grunt.registerTask('server', ['compile', 'runNode', 'watch']);

  // Default task(s).
  grunt.registerTask('default', ['compile']);

};
