[p2pwebsharing](http://tinyboxdev.github.com/p2pwebsharing) [![Build Status](https://travis-ci.org/TinyBoxDev/p2pwebsharing.png?branch=master)](https://travis-ci.org/TinyBoxDev/p2pwebsharing) 
=============


P2P Websharing is a simple browser-based platform for communicating and file sharing. It is hard pre-alpha version, so don't get mad if something is not working.

In order to make it work, you just need to:

1. get Node.js properly working on your machine
2. clone this repository with `git clone https://github.com/TinyBoxDev/p2pwebsharing`
3. move in the repository folder with `cd ~/p2pwebsharing/`
4. install all required node modules with `npm install`
5. create your bundle with `make compile`
6. launch your server with `./bin/p2p` or with `NODE_PATH="./lib/" node web.js`

You can execute all the application tests in 2 different ways:

1. launch server tests with `make test`
2. launch modules tests with `make testweb` (you need Chrome Canary to be installed!)

If you wanna be super fast, just type `make` while you are inside the root folder of the project and let us do the rest.
