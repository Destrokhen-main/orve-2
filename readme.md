<h1 align="center">ORVE</h1>

Library for creating reactive SPA applications

```javascript
import { ref, orveCreate, computed, If, For } from "orve";

function Component() {
  const r = ref(0);
  const b = computed(() => r.value * 2)

  return (
      <div>
        <If rule={() => r.value > 2}>
          <div o-if={true}>
            now you see me
          </div>
        </If>

        <For each={b}>
          {
            (_, i) => {
              return <div>{i + 1}</div>
            }
          }
        </For>

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
app.createApp(App)
app.mount("#app");
```


# Some tests

| Operation            | time (ms)   |
|----------------------|-------------|
| Create 1000 row      | 30ms - 31ms |
| Create 10000 row     | 236ms-240ms |
| Append 1000 row []   | 29.99 ms    |
| Append 1000 -> 10000 | 393 ms      |
| Update               | 47ms        |
| Clear 1000           | 15.33ms     |
| Clear 10000          | 103.3ms     |
| Splice first (1000)  | 47.3ms      |
| Splice first (10000) | 350ms       |
| Select               | 1.4ms       |

*The library is not ready, the required optimization levels are not used yet. The indicators will be updated over time.*