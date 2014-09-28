# node-tiny-dploy

> Simple shell script + PM2 node.js deployer

This CLI will be helpful if you host the server with multiple applications and use `bash` scripts in order to redeploy them. Instead of supporting multiple files:

```bash
user@server:~$ ls -a
app1-prod-restart.sh
app1-staging-restart.sh
app2-prod-restart.sh
app2-staging-restart.sh
...
```

Just use one configuration file and several commands with `dploy`.

## Install

```bash
npm install tiny-dploy --save
```

## Commands

### ``dploy setup``

Creates new application instance. It will automatically clone repository into `/var/www`, install `npm` and `bower` dependencies, build application with `grunt build` and start application with `pm2`. Command will prompt you with available configuration options.

```bash
user@server:~$ dploy setup
name: staging
git url: git@bitbucket.org:user/test-app.git
git branch (master): rc_0 # defaults to `master`
node (app.js): app.coffee # defaults to `app.js`
folder in /var/www/ : test-app-dir # will look at `name` if not specified
pm2 process: test-app # will look at folder or `name` if not specified
pm2 opts: -i 4 # pm2 options
NODE_ENV (development): staging
NODE_PORT (80): 8081

-----> Clone git repo into folder with name "test-app"
...
```

### ``dploy list``

Lists instances created with `dploy setup`.

```bash
user@server:~$ dploy list
staging
production
```

### ``dploy reload [app]``

Reloads application instance without stopping it. Command fetches latest changes on specified `branch`, installs missed dependencies, builds it and restarts app silently with `pm2`.

### ``dploy restart [app]``

Stops running `pm2` app and performs the same actions as `dploy reload` then.

## Requirements

You need these tools to be installed on your machine in order to work with `dploy`:

- [git](http://git-scm.com/downloads)
- [bower](http://bower.io)
- [grunt](http://gruntjs.com)
- [PM2](https://github.com/Unitech/pm2)

## Configuration

All configuration options are stored inside `.dploy_config.json` file which is located in your systems `HOME_DIR`. For [`dploy setup` example](https://github.com/voronianski/node-tiny-dploy#dploy-setup) generated json file will be as follows:

```json
{
  "staging": {
      "git": "git@bitbucket.org:user/test-app.git",
      "branch": "rc_0",
      "node": "app.coffee",
      "folder": "test-app-dir",
      "pm2": "test-app",
      "pm2 opts": "-i 4",
      "node_env": "staging",
      "port": "8081"
   }
}
```

You're free to make changes inside in order to update necessary application. There should be added special commands for that in the future.

## To Do

- [ ] Support for [gulp](http://gulpjs.com).

- [x] Command `dploy remove [app]` for removing apps from config and all necessary data.

- [ ] Command for editing app options `dploy set [app] branch:production`.

- [ ] Prettify outputs with colors.

- [ ] Add ascii table for list.

## Projects

List of the projects using this small and helpful hack :sunglasses: :

- [Mirror Football](http://www.mirror.co.uk/sport/football) - deploys for HTML5 mobile apps.

[<img src="https://dl.dropboxusercontent.com/u/100463011/mirrorfootball.jpg" width="300">](http://m.mirrorfootball.com)

## License

MIT Licensed

Copyright (c) 2014, Dmitri Voronianski [dmitri.voronianski@gmail.com](mailto:dmitri.voronianski@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
