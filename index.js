require('shelljs/global');

var fs = require('fs');
var homedir = require('userhome');

if (fs.existsSync(homedir('.dploy_config.json'))) {
	var config = require(homedir('.dploy_config.json'));
} else {
	echo('Error: Please create `.dploy_config.json` file in HOME_DIR');
	exit(1);
}

function _sync () {
	echo('-----> git pull');
	var pull = exec('git pull');
	if (pull.code !== 0) {
		echo('Error: Git pull failed');
		exit(1);
	}

	echo('-----> npm install');
	var install = exec('npm install');
	if (install.code !== 0) {
		echo('Error: Npm install failed');
		exit(1);
	}

	echo('-----> grunt build');
	var grunt = exec('grunt build');
	if (grunt.code !== 0) {
		echo('Error: Grunt build failed');
		exit(1);
	}
}

exports.reload = function (name) {
	var instance = config[name];
	if (!instance) {
		echo('Error: There is no such instance ['+name+'] in config');
		exit(1);
	}

	var folder = instance.folder || name;
	echo('-----> cd /var/www/'+folder);
	cd('/var/www/'+folder);

	_sync(name);

	var proc = instance.pm2 || folder || name;
	echo('-----> pm2 reload '+proc);
	var pm2 = exec('pm2 reload '+proc);
	if (pm2.code !== 0) {
		echo('Error: PM2 reload failed');
		exit(1);
	}
};

exports.restart = function (name) {
	var instance = config[name];
	if (!instance) {
		echo('Error: There is no such instance ['+name+'] in config');
		exit(1);
	}

	var folder = instance.folder || name;
	var proc = instance.pm2 || folder || name;

	echo('-----> pm2 stop '+proc);
	var pm2stop = exec('pm2 stop '+proc);
	if (pm2stop.code !== 0) {
		echo('Error: PM2 stop failed');
		exit(1);
	}

	echo('-----> cd /var/www/'+folder);
	cd('/var/www/'+folder);

	_sync(name);

	var cmd = [
		'pm2 start /var/www/'+folder+'/'+instance.node,
		'--name',
		proc,
		'-f'
	];
	if (instance.env) {
		cmd.unshift('NODE_ENV='+instance.env);
	}
	if (instance.port) {
		cmd.unshift('NODE_PORT='+instance.port);
	}

	var cmdstr = cmd.join(' ');
	echo('-----> ' + cmdstr);
	var pm2start = exec(cmdstr);
	if (pm2start.code !== 0) {
		echo('Error: PM2 start failed');
		exit(1);
	}
};
