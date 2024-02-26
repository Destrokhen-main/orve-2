### computedEffect

Принцип данной функции схож с computed. Прочтите информацию об computed перед этим

computedEffect просто позволяет не следить за зависимостями.

под капотом это тот же computed, только перед привязкой к зависимостям, он выполнит функцию и найдёт всё связи.

Пример
```
const a = ref(1)
const b = ref(2)

const c = computedEffect(() => a.value + b.value)
```

в таком случаи computed получит массив из [a, b]

Вы можете отдавать контроль функции выше

```
const a = ref(1)
const b = ref(2)

function M() {
  ....
  a.value
  ....
  b.value
}

const c = computedEffect(() => M())
```

в таком случаи массив зависимостей будет так же правильно определять зависимые переменные.
