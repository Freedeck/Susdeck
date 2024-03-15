# Docker Install

This setup officially supports `docker-compose` or `docker compose`. I'll make a guide for using the raw dockerfile later. This guide is going to use `docker compose`.

## Limitations

Please be aware that installing through Docker limits your usage of plugins. As of current, you are unable to install plugins on a Docker installation due to losing your config @ rebuild time.

## Initial Setup

You can use `docker compose up` to initially start Freedeck. A link will appear in your console to go to the setup wizard. Open it and follow the instructions on screen. After you finish that, you can take the container down with `docker compose down`, then bring it up with `docker compose up -d` to run it in the background.

## Installing Plugins

[This is unsupported for now. Check out Limitations.](#limitations)
