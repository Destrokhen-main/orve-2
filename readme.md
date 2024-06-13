<h1 align="center">ORVE</h1>

Library for creating reactive SPA applications

```javascript
import { ref, orveCreate, computedEffect } from "orve";

function Component() {
  const r = ref(0);
  const b = computedEffect(() => r.value * 2)

  return (
      <div>
          <p>{r}</p>
          <p>{b}</p>
          <button
            onClick={() => { r.value += 1; }}
          >
            Click
          </button>
      </div>
    )
}

const app = orveCreate();
app.createApp(Component)
app.mount("#app");
```
