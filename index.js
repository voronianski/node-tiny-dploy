require('shelljs/global');

var config = require('./config');

exports.reload = function (name) {
	var instance = config[name];
	if (!instance) {
		echo('Error: There is no such instance ['+name+'] in config');
		exit(1);
	}

	var folder = instance.folder || name;
	echo('-----> cd /var/www/'+folder);
	cd('/var/www/'+folder);

	echo('-----> git pull');
	var pull = exec('git pull');
	echo(pull.output);
	if (pull.code !== 0) {
		echo('Error: Git pull failed');
		exit(1);
	}

	echo('-----> npm install');
	var install = exec('npm install');
	echo(install.output);
	if (install.code !== 0) {
		echo('Error: Npm install failed');
		exit(1);
	}

	echo('-----> grunt build');
	var grunt = exec('grunt build');
	echo(grunt.output);
	if (grunt.code !== 0) {
		echo('Error: Grunt build failed');
		exit(1);
	}

	var proc = instance.pm2 || folder || name;
	echo('-----> pm2 reload '+proc);
	var pm2 = exec('pm2 reload '+proc);
	echo(pm2.output);
	if (pm2.code !== 0) {
		echo('Error: PM2 reload failed');
		exit(1);
	}
};