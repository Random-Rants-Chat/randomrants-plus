#!/bin/bash
git init
git remote add origin https://github.com/random-rants-chat/randomrants-plus
git add *
git commit -m "Upload via git push command"
git push -f origin  main
