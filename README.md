# Yarn Workspace Clean Reactive Monorepo

- This demos yarn workspaces simplicity for managing multiple repos; in this case, the purpose is to host a ui & observable library as well as an app that consumes them
- test

### Run

- running yarn && yarn dev in the root directory will install node_modules for both repos (the app & its ui library) & run the app

```shell
yarn && yarn dev
```

### Clean

- running yarn clean in the root directory will remove node_modules from both repos (the app & its ui library)

```shell
yarn clean
```
