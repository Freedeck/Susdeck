@ECHO off
npm i
Set NODE_OPTIONS="--max-old-space-size=10960" && npm start