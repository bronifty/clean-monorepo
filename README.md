# Yarn Workspace Clean Reactive Monorepo

### Config

- This demos yarn workspaces simplicity for managing multiple repos; in this case, the purpose is to host a ui & observable library as well as an app that consumes them
- The way multiple repos are used together aside from running all scripts in unison, is by linking the projects by their name in the package.json to a dependency in the consumer app. For instance, the ui will have it's name as ui in its own package.json then the consumer of the ui (web app) will list ui as one of its dependencies like so...

```js
// monorepo/packages/ui/package.json
{
  "name": "ui",
 // ...
}

// monorepo/packages/consumer-web-app/package.json
{
  "name": "consumer-web-app",
  // ...
  "dependencies": {
    "ui": "*"
  },
// ...
}
```

- then once the packages are linked, the consumer app can import the ui like so...

```tsx
// ui/src/components/index.tsx
import * as React from "react";
export * from "./Header";
export * from "./CounterButton";

// web/src/routes/index.tsx
import { Header, CounterButton } from "ui/src/components";
export function Index() {
  return (
    <div>
      <Header />
      <CounterButton />
    </div>
  );
}
```

### Run

```shell
yarn && yarn dev
```

### Clean

```shell
yarn clean
```
