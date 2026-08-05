@echo off

cd /d "C:\Users\owens\Downloads\S.V.E.C Code\Python Projects\SST Earthquakes"

start "" python -m http.server 8000

timeout /t 2

start "" http://localhost:8000/index.html

pause