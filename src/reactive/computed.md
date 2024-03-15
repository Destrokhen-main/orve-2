### Computed

В orve есть 2 вида вычисляемых функций. computed и computedEffect

Отличаются они тем, что в computed вы сами должны угазать зависимости

Пример:
```
const a = ref(1)
const b = ref(2)

const c = computed(() => a.value + b.value, [a,b])
```

В таком примере, computed будет пересчитываться каждый раз при изменение a или b. Если мы в массиве оставим только a, то соотвественно будет обновлять только при изменение a

Обратите внимание в случаи условной зависимости
```
const c = computed(() => {
  if (a.value)
    b.value
  else
    g.value
}, [a,b,g])
```

В таком случаи лучше будет использовать computedEffect, чтобы не создавать дополнительных ненужных перерисовок. Он самостоятельно будет выставлять зависимости и удалять ненужные
