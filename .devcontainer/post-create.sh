#!/bin/bash

# This script runs automatically when the Codespace is created.

# It prints a welcome message to the terminal.
echo "Codespace setup complete. Running npm install..."

# It automatically installs the project dependencies from package.json.
npm install

echo "Dependencies installed. You can now start the server with 'npm start'"
