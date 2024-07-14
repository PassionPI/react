# createNav

This help you use `nav` outside the react component when you use React Router V6.  
Like React Router V5 use `history.push` anywhere.

## Init

```typescript
const { nav, Nav } = createNav();
```

## Add to React component

In top of the component which has `<Outlet />` element. Usually `RootLayout`.  
Use `Nav`, like this.

```typescript
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <YourLayout>
      <Nav />
      <Outlet />
    </YourLayout>
  );
};
```

## Use anywhere

### Type definition

```typescript
import type { Location, NavigateOptions, Params, To } from "react-router-dom";
type Update = { location: Location; params: Readonly<Params<string>> };
type Listener = (update: Update) => void;
type Navigate = {
  go: (to: To, options?: NavigateOptions) => void;
  listen: (listener: Listener) => () => void;
};
```

### `nav.go` is same signature with React Router V6 `useNavigate` returned function.

```typescript
nav.go("/your_path");
nav.go("/your_path", { replace: true });
nav.go({ pathname: "/your_path" });
```

### `nav.listen` accept a function and call it when React Router V6 has changed router.

```typescript
nav.listen(async ({ location, params }) => {
  // do something after react router change route
});
```

## Sequence

### Sequence when you use `navigate` by React Router V6.

1. React Router call `navigate('/your_path')`
2. React Router call `loader`
3. React Router update location
4. React update `useEffect`
5. nav call `listeners` you listen

### Sequence when you use `nav` by this package (like this `nav.go('/your_path')`).

1. nav call `nav.go('/your_path')`
2. React update by `useSyncExternalStore`
3. React update `useEffect`
4. React Router call `navigate('/your_path')`
5. React Router call `loader`
6. React Router update location
7. React update `useEffect`
8. nav call `listeners` you listen
