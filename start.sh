#!/bin/bash

# Start client server
gnome-terminal -- bash -c "cd client/ && npm run dev"

# Start delta client
gnome-terminal -- bash -c "cd api/ && php artisan serve"
