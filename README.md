# node-tiny-deploy

> Simple shell script + PM2 deployer

## Install

```bash
npm install tiny-dploy --save
```

## Commands

### ``dploy setup``

Creates new application instance. 

It will automatically clone repository into `/var/www`, install dependencies, build application with `grunt build` and start application with `pm2`. Command will prompt you with available configuration options.

```bash
user@server:~$ dploy setup
name: test-app
git url: git@bitbucket.org:user/test-app.git
git branch (master): rc_0
node (app.js): app.coffee
folder in /var/www/ : test-app-dir # will look at name if not specified
pm2 process: test-app # will look at folder or name if not specified
NODE_ENV (development): staging
NODE_PORT (80): 8081

-----> Clone git repo into folder with name "test-app"
```

### ``dploy list``

List instances created with `dploy setup`.

### ``dploy reload``

### ``dploy restart``

## Example

## Requirements

You need these tools to be installed on your machine in order to work with _tiny-dploy_:

- [git](http://git-scm.com/downloads)
- [bower](http://bower.io)
- [grunt](http://gruntjs.com/)
- [PM2](https://github.com/Unitech/pm2)

## Projects

List of the projects using this small and helpful hack :sunglasses: :

- [Mirror Football](http://www.mirror.co.uk/sport/football) - deploys for different mobile apps

[<img src="https://dl.dropboxusercontent.com/u/100463011/mirrorfootball.jpg" width="250">](http://m.mirrorfootball.com)

