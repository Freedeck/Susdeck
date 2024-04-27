@ECHO off
if [%1]==[] goto load
cd %1

:load
Set NODE_OPTIONS="--max-old-space-size=10960" && npm start