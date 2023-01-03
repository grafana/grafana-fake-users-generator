# Grafana fake users generator

This tool can generate fake users for Grafana.

## Dependencies

In order to use this tool, install dependencies first:

```sh
yarn install --immutable
```

## Configuration

Copy example config and set Grafana URL, login and password.
Use admin account since creating users required Grafana admin permissions.

```sh
cp config.example.json config.json
```

## Usage

To create users run script with `create` param. This command creates 100 fake users.

```sh
node ./main.js create 100
```

To remove fake users use `delete` command:

```sh
node ./main.js delete
```
