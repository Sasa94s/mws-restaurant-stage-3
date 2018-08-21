# Udacity Mobile Web Specialist Nanodegree
---
#### _Three Stage Course Material Project - Restaurant Reviews_
by Mostafa Elsheikh, in fulfillment of Udacity's [Mobile Web Specialist Nanodegree](https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024)

## Project Overview: Stage 2

>Previously, I have worked on a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. I have added a service worker to begin the process of creating a seamless offline experience for your users.

In **Stage Two**, I have begin by using asynchronous JavaScript to request JSON data from the backend server. Received data from the server is then stored in an offline database using IndexedDB, which will create an app shell architecture. The site will be optimized to meet performance benchmarks, which are tested using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

A [Node development server](https://github.com/udacity/mws-restaurant-stage-2) and API is already provided to make JSON requests to the server. Core functionality of the application will not change, only the source of the data will change. We're using the Fetch API to make requests to the backend server to populate the content of our PWA.

### About

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

#### Development local API Server
_Location of server = /server_
Server depends on [node.js LTS Version: v6.11.2 ](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/get-npm), and [sails.js](http://sailsjs.com/)
Please make sure you have these installed before proceeding forward.

### Getting Started

1. Download appropriate [Node.js installer](https://nodejs.org/en/download/) for your platform
2. Open your Terminal/CLI
3. Install App dependencies
    ```Install dependencies
    npm install
    ```
4. Install local API server dependencies
    ```Install local API server dependencies
    cd server/ && npm install && cd ..
    ```
5. Run local API server
    ```Run local API server
    npm run server
    ```
6. Open another Terminal and Run local client server
    ```Run local client server
    npm start
    ```
7. Open http://localhost:3000 from your browser


### Preview