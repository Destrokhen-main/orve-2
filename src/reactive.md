### Концепция реактивности

Для динамического обновления UI элементов в библиотеки используются реактивные переменные

Заметим сразу, реактивная переменная может быть не привязана к компоненту. Вы можете создать её на каком-то уровне и использовать где необходимо

Попробуем решить средствами библиотеки классическую задачу

```
A + B = C
```

При изменение A или B должен пересчитываться C

```
const A = ref(1)
const B = ref(2)

const C = computed(() => A.value + B.value, [A, B])
ИЛИ
const C = computedEffect(() => A.value + B.value)
```

Теперь C будет обновляться каждый раз при изменение A или B

### Как это работае

Когда вы создаёте реактивную переменную, вы по сути создаёте объект со всеми адресами на эту переменную

После создания ref вы получите => { value: ..., $sub: ...., type: .... }

Все зависимости лежат в $sub. По сути это Set из callback

Если расмотрим пример выше, то получиться
```javascript
const A = ref(1) // { value: 1, $sub: [ { C } ] }
const B = ref(2) // { value: 2, $sub: [ { C } ] }

const C = computedEffect(() => A.value + B.value) // { value: 3, $sub: [] }
```

Когда появляется вычисляемое свойство. В зависимости используемых реактивных переменных, упадёт специальная функция, которая будет вызываться при изменение.

Например
Привяжем переменную A к какому-то элементу в интерфейсе

```javascript
function App() {
  const A = ref(1);

  return <div>{A}</div>
}
```

На момент отрисовки, маунтер создаcт div а в детях этого div создаст связь A с этим куском ребенка div

Как примерно будет выглядить эта связь
```
(newValue) => {
  работа с элементом.
}
```

Пеперь в A будет лежать эта функция и при изменение в неё будет прокинуто новое значение.


При разработке представляйте, что вы создаёте линию, Например как в rxjs

------o-----o----o-----o

Что из себя может представлять линия.

Например в начале пути вы создали реактивную переменную

ref----

Дальше эта реактивная переменная стала зависима для computed

ref----computed

И в конечном итоге computed попадает в html элемент

ref----computed----<html>

Таким образом можно мыслено построить линию.

Конечно вам никто не запрещает вставлять и сам ref в html

тогда линия просто неомного преобразиться

ref----computed----<html>
    \
     ---- <html>