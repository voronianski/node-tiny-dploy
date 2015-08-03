require('shelljs/global');

var pkginfo = require('pkginfo')(module, 'version');

var fs = require('fs');
var homedir = require('userhome');
var Table = require('cli-table');

var config;
function _checkConfig (skipExit) {
    if (config) {
        return;
    }

    var configFile = homedir('.dploy_config.json');
    if (fs.existsSync(configFile)) {
        config = require(configFile);
    } else {
        if (!skipExit) {
            echo('Error: Please create `.dploy_config.json` file in HOME_DIR');
            echo('Error: Or run `dploy setup` to create first instance');
            exit(1);
        }
    }
}

function _sync (opts) {
    // pull branch
    echo('-----> git pull');
    var pull = exec('git pull');
    if (pull.code !== 0) {
        echo('Error: Git pull failed');
        exit(1);
    }

    // npm
    echo('-----> npm install');
    var install = exec('npm install');
    if (install.code !== 0) {
        echo('Error: Npm install failed');
        exit(1);
    }

    // bower
    if (opts.bower === 'true' || opts.bower === true) {
        echo('-----> bower install');
        var bower = exec('bower install');
        if (bower.code !== 0) {
            echo('Error: Bower install failed');
            exit(1);
        }
    }

    // gulp or grunt or npm
    if (opts.build === 'gulp') {
        echo('-----> gulp build');
        var gulp = exec('gulp build');
        if (gulp.code !== 0) {
            echo('Error: Gulp build failed');
            exit(1);
        }
    } else if (opts.build === 'grunt') {
        echo('-----> grunt build');
        var grunt = exec('grunt build');
        if (grunt.code !== 0) {
            echo('Error: Grunt build failed');
            exit(1);
        }
    } else if (opts.build === 'npm') {
        var env = opts.env || opts.node_env;
        echo('-----> NODE_ENV=' + env + ' npm run build');
        var npm = exec('NODE_ENV=' + env + ' npm run build');
        if (npm.code !== 0) {
            echo('Error: npm build failed');
            exit(1);
        }
    }
}

function _coerce (value) {
    if (value.trim && value.trim() === '') {
        return value;
    }

    var num = Number(value);
    if (!isNaN(value)) {
        return num;
    }

    var _value = value.toLowerCase();
    if (_value === 'true') {
        return true;
    }
    if (_value === 'false') {
        return false;
    }

    return value;
}

exports.reload = function (name) {
    _checkConfig();

    var instance = config[name];
    if (!instance) {
        echo('Error: There is no such instance [' + name + '] in config');
        exit(1);
    }

    var folder = instance.folder || name;
    echo('-----> cd /var/www/' + folder);
    cd('/var/www/' + folder);

    _sync(instance);

    var proc = instance.pm2 || folder || name;
    echo('-----> pm2 reload ' + proc);
    var pm2 = exec('pm2 reload ' + proc);
    if (pm2.code !== 0) {
        echo('Error: PM2 reload failed');
        exit(1);
    }
    echo('-----> Success! Instance [' + name + '] was realoded via pm2');
    exit(0);
};

exports.restart = function (name) {
    _checkConfig();

    var instance = config[name];
    if (!instance) {
        echo('Error: There is no such instance [' + name + '] in config');
        exit(1);
    }

    var folder = instance.folder || name;
    var proc = instance.pm2 || folder || name;

    echo('-----> pm2 stop ' + proc);
    exec('pm2 stop ' + proc);

    echo('-----> cd /var/www/' + folder);
    cd('/var/www/' + folder);

    _sync(instance);

    var cmd = [
        'pm2 start /var/www/' + folder + '/' + instance.node,
        '--name',
        proc,
        '-f'
    ];
    instance.env = instance.env || instance.node_env;
    if (instance.env) {
        cmd.unshift('NODE_ENV=' + instance.env);
    }
    if (instance.port) {
        cmd.unshift('NODE_PORT=' + instance.port);
    }
    if (instance.opts) {
        cmd.push(instance.opts);
    }

    var cmdstr = cmd.join(' ');
    echo('-----> ' + cmdstr);
    var pm2start = exec(cmdstr);
    if (pm2start.code !== 0) {
        echo('Error: PM2 start failed');
        exit(1);
    }
    echo('-----> Success! Instance [' + name + '] was restarted via pm2');
    exit(0);
};

exports.create = function (cfg) {
    _checkConfig(true);

    var name = cfg.name;

    if (!config) {
        config = {};
    }
    config[name] = cfg;
    delete config[name].name;
    var str = JSON.stringify(config, null, 2);

    fs.writeFile(homedir('.dploy_config.json'), str, function (err) {
        if (err) {
            echo(err);
            exit(1);
        }

        var instance = config[name];
        var folder = instance.folder || name;
        var proc = instance.pm2 || folder || name;

        cd('/var/www');

        echo('-----> Clone git repo into folder with name "' + folder + '"');
        var gitStr = 'git clone ' + instance.git + ' --branch ' + instance.branch + ' ' + folder;
        echo('-----> ' + gitStr);
        var git = exec(gitStr);
        if (git.code !== 0) {
            echo('Error: Git clone failed');
            exit(1);
        }

        exec('sudo chown -R $USER ' + folder);

        cd('/var/www/' + folder);

        _sync(instance);

        var cmd = [
            'pm2 start /var/www/' + folder + '/' + instance.node,
            '--name',
            proc,
            '-f'
        ];

        instance.env = instance.env || instance.node_env;
        if (instance.env) {
            cmd.unshift('NODE_ENV=' + instance.env);
        }
        if (instance.port) {
            cmd.unshift('NODE_PORT=' + instance.port);
        }
        if (instance.opts) {
            cmd.push(instance.opts);
        }

        var cmdstr = cmd.join(' ');
        echo('-----> ' + cmdstr);
        var pm2 = exec(cmdstr);
        if (pm2.code !== 0) {
            echo('Error: PM2 start failed');
            exit(1);
        }
        echo('-----> Success! Instance [' + name + '] is running via pm2');
        exit(0);
    });
};

exports.list = function () {
    _checkConfig();

    var table = new Table({
        head: ['Name', 'PM2', '/var/www/'],
        colWidths: [20, 30, 30],
        style: {compact: true}
    });

    for (var name in config) {
        var instance = config[name];
        var folder = instance.folder || name;
        var proc = instance.pm2 || folder || name;
        table.push([name, proc, folder]);
    }
    echo(table.toString());
};

exports.remove = function (name) {
    _checkConfig();

    var instance = config[name];
    if (!instance) {
        echo('Error: There is no such instance [' + name + '] in config');
        exit(1);
    }
    var folder = instance.folder || name;
    var proc = instance.pm2 || folder || name;

    echo('-----> pm2 delete ' + proc);
    exec('pm2 delete ' + proc);

    delete config[name];
    var str = JSON.stringify(config, null, 2);

    fs.writeFile(homedir('.dploy_config.json'), str, function (err) {
        if (err) {
            echo(err);
            exit(1);
        }

        echo('-----> cd /var/www/');
        cd('/var/www/');

        echo('-----> rm -rf /var/www/' + folder + '/');
        rm('-rf', '/var/www/' + folder + '/');

        exit(0);
    });
};

exports.set = function (name, prop, value) {
    _checkConfig();

    var instance = config[name];
    if (!instance) {
        echo('Error: There is no such instance [' + name + '] in config');
        exit(1);
    }

    value = _coerce(value);

    echo('-----> Set "' + prop + '" = "' + value + '"');
    instance[prop] = value;
    var str = JSON.stringify(config, null, 2);

    fs.writeFile(homedir('.dploy_config.json'), str, function (err) {
        if (err) {
            echo(err);
            exit(1);
        }

        echo('-----> Success! Instance [' + name + '] is updated');
        exit(0);
    });
};
