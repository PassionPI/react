# useReactive

This help you use `reactive` state in React component.

## Use

```tsx
import { useReactive } from "@passion_pi/react";

const App = () => {
  // reactive is a proxy object
  // reactive has immutable reference
  // reactive only change the property's value & reference
  const reactive = useReactive({ count: 0 });

  return (
    <div>
      <button onClick={() => reactive.count++}>+</button>
      <Count count={reactive.count} />
      <button onClick={() => reactive.count--}>-</button>
    </div>
  );
};

const Count = ({ count }: { count: number }) => {
  return <span>{count}</span>;
};
```

Note:

- `reactive` is a proxy object. You can use it like a normal object.
- `reactive` is a reactive object. When you change the value, it will re-render the component.
- `reactive` only support `object` that can be `JSON.stringify`, so not support such as `Map` & `Set`.
- `reactive` has immutable reference, so you can only use it's property as component's props.
