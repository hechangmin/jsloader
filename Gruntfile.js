module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                sourceMap: 'js/lib/jsloader.js.map',
                beautify: {
                    //中文ascii化，非常有用！防止中文乱码的神配置
                    ascii_only: true
                }
                //banner : '/*{name : <%= pkg.name %>, author : <%= pkg.author %>, date : <%= grunt.template.today("yyyy-mm-dd") %>}*/'
            },
            build: {
                src: 'js/lib/jsloader-debug.js',
                dest: 'js/lib/jsloader.min.js'
            }
        },

        replace: {
            toDebug : {
                src: ['*.html'],
                overwrite: true,
                replacements: [{
                    from: /jsloader.min.js/g,
                    to: "jsloader-debug.js"
                }]
            },

            toRelease : {
                src: ['*.html'],
                overwrite: true,
                replacements: [{
                    from: /(jsloader-debug.js\?v=\d*)|(jsloader.min.js\?v=\d*)/g,
                    to: 'jsloader.min.js?v=<%= grunt.template.date("yyyymmddHHMMss")%>'
                }]
            },

            fixmap : {
              src: ['js/lib/jsloader.js.map'],
                overwrite: true,
                replacements: [{
                    from: '"file":"js/lib/jsloader.min.js"',
                    to: '"file":"jsloader.min.js"'
                },{
                    from: '"sources":["js/lib/jsloader-debug.js"]',
                    to: '"sources":["jsloader-debug.js"]'
                }]
            },

            fixMinJs : {
               src: ['js/lib/jsloader.min.js'],
                overwrite: true,
                replacements: [{
                    from: 'sourceMappingURL=js/lib/jsloader.js.map',
                    to: 'sourceMappingURL=jsloader.js.map'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify', 'replace:fixmap', 'replace:fixMinJs', 'replace:toRelease']);
};