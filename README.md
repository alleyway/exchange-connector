# Get balances from exchange to use in google sheets

## get running

create a creds.json file by running the following:

    clasp open --creds

then login with:

    clasp login --creds creds.json

Run a function remotely:

    clasp run getByBitBalances -p '["BYBIT_API_KEY", "BYBIT_API_SECRET"]'


View execution logs here:

[https://script.google.com/home/projects/15AEyyWJfL5iNl5d_QURHUB8v7RMTXKp6b-Ma33ODvMPf7LGTNPPm7CHH/executions](https://script.google.com/home/projects/15AEyyWJfL5iNl5d_QURHUB8v7RMTXKp6b-Ma33ODvMPf7LGTNPPm7CHH/executions)

    clasp logs --open


## usage

Open sheets, script editor

Resources -> Libraries...

add the following (this script):

    15AEyyWJfL5iNl5d_QURHUB8v7RMTXKp6b-Ma33ODvMPf7LGTNPPm7CHH

(development mode will take the currently "pushed" script, otherwise uses the deployed version)




##


using clasp https://github.com/google/clasp


    npm install -g @google/clasp
    clasp login


Edit files and push (test in "developer mode")

    npm run push


for testing go here: 
 
 https://docs.google.com/spreadsheets/d/1ip3kQVBBZLZjU1rqp_8sZ5nSK6IXYqgwqTxrfGZBN4Q/edit#gid=0
    

#### Deploy a version

    clasp deploy --description "my latest deployment"    
