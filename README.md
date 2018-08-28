# Udacity Mobile Web Specialist Nanodegree
---
#### _Three Stage Course Material Project - Restaurant Reviews_
by Mostafa Elsheikh, in fulfillment of Udacity's [Mobile Web Specialist Nanodegree](https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024)

## Project Overview: Stage 2

>Previously, I have worked on a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. I have added a service worker to begin the process of creating a seamless offline experience for your users. Then, I have begun by using AJAX with Fetch API to request JSON data from backend server, and stored the site content offline using IndexedDB, which is our app shell architecture to optimize performance and populate the content of our PWA.

In **Stage Three**, I have added a validated form submission that allows user to add a review for a restaurant even if there is lack of connectivity, It takes the user submission and store it until the connection restablishes to send back a POST request to backend server. I have added a favorite button that sends PUT request to backend server to update the state of a restaurant, which works offline as well.

### About

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

#### Development local API Server
_Location of server = /server_
Server depends on [node.js LTS Version: v6.11.2 ](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/get-npm), and [sails.js](http://sailsjs.com/)
Please make sure you have these installed before proceeding forward.

### Getting Started

1. Download appropriate [Node.js installer](https://nodejs.org/en/download/) for your platform
2. Open your Terminal/CLI
3. Install local client & API server dependencies
    ```Install dependencies
    npm run install-server
    ```
4. Run local API server
    ```Run local API server
    npm run server
    ```
5. Open another Terminal and Run local client server
    ```Run local client server
    npm start
    ```
6. Open http://localhost:3000 from your browser


### Preview