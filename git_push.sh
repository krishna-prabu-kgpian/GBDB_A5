#!/bin/bash
git init
git add .
git commit -m "Final submission: Fixed UI, alerts, database logic, and added documentation"
git branch -M main
git remote add origin https://github.com/krishna-prabu-kgpian/GBDB_A5
# Try pulling first to avoid conflicts if repo is not empty
git pull origin main --rebase
git push -u origin main
