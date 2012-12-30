p2pwebsharing
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
2. launch modules tests by opening with FirefoxNightly `./testweb/runner.html` and enjoy mocha
