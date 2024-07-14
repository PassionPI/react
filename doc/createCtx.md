# createCtx

```typescript
import { useEffect, useState } from "react";

const { useCtx, useReselect, provider } = createCtx(
  (props?: { name?: string }) => {
    const { name } = props || {};
    const [name, setName] = useState("");
    const [age, setAge] = useState(0);

    useEffect(() => {
      if (name) {
        setName(name);
      }
    }, [name]);

    return {
      name,
      age,
      setName,
      setAge,
    };
  }
);

const NameDisplay1 = provider(() => {
  const { name, setName } = useCtx();
  return <div onClick={() => setName("Bob")}>{name}</div>;
});

const NameDisplay2 = provider(() => {
  const name = useCtx((ctx) => ctx.name);
  const setName = useCtx((ctx) => ctx.setName);
  return <div onClick={() => setName("Bob")}>{name}</div>;
});

const NameDisplay3 = provider(() => {
  const { name, setName } = useReselect(
    [(state) => state.name, (state) => state.setName],
    (name, setName) => ({ name, setName })
  );
  return <div onClick={() => setName("Bob")}>{name}</div>;
});

const NameDisplay4: FC<{ name: string }> = provider({
  connect: (props) => ({ name: props.name }),
  component: () => {
    const { name, setName } = useCtx(); // name is from props & will sync with props
    return <div onClick={() => setName("Alice")}>{name}</div>;
  },
});
```
