```javascript
import { computedEffect, ref } from 'orve'

function ModalCreateTodo({ createTodo, item, index }) {
  const title = ref(item?.title ?? '')
  const descriptions = ref(item?.descriptions ?? '')
  const createTodoFunc = () => {
    createTodo(title.value, descriptions.value, index ?? null)
    title.value = ""
    descriptions.value = ""
  }
  
  return (
    <div>
      <div>
        <label>
          <p>Название задачи</p>
          <input value={title} onInput={(e) => { title.value = e.target.value }}/>
        </label>
      </div>
      <div>
        <label>
          <p>Описание задачи</p>
          <textarea value={descriptions} onInput={(e) => { descriptions.value = e.target.value }}></textarea>
        </label>
      </div>
      <div>
        <button onClick={createTodoFunc}>{
          index === null ? 'Создать' : 'Редактировать'
        }</button>
      </div>
    </div>
  )
}

function Todo({ title, descriptions, id, index, done, doneTodo, deleteTodo, edit }) {
  return (
    <div class={style.todo} >
      <div>
        <h3><input type="checkbox" checked={done} onInput={() => doneTodo(id)} /> [{index}] { title }</h3>
        <p>{ descriptions }</p>
      </div>
      <div>
        <div>
          <button class={style['action-btn']} onClick={() => deleteTodo(id)}>Удалить</button>
        </div>
        <div>
          <button class={style['action-btn']} onClick={() => edit(id)}>Редактировать</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const showModal = ref(false)
  const todos = ref([ { id: 1, title: "Задача", descriptions: "Описание", done: false }, { id: 2, title: "Задача-1", descriptions: "Описание", done: false }, { id: 3, title: "Задача-2", descriptions: "Описание", done: false } ]);
  const selectedIndex = ref(null);

  const doneTodo = (id) => {
    const item = todos.value.find((e) => e.id === id);
    item.done = !item.done;
  } 

  const deleteTodo = (index) => {
    const findIndex = todos.value.findIndex((e) => e.id === index)
    todos.value.splice(findIndex, 1)
  }

  const createTodo = (title, descriptions, index = null) => {
    if (index === null) {
      todos.value.push({
        title,
        descriptions,
        done: false
      })
    } else {
      const item = todos.value.find((e) => e.id === index);
      item.title = title;
      item.descriptions = descriptions;
      selectedIndex.value = null;
    }
    showModal.value = false
  }

  const editFunc = (index) => {
    selectedIndex.value = index
    showModal.value = true;
  }

  const readyTodo = computedEffect(() => {
    return todos.value.filter((i) => i.done)
  })

  const notreadeTodo = computedEffect(() => {
    return todos.value.filter((i) => !i.done)
  })

  return (
    <div class={style.window}>
      <div class={style['d-flex-a-c-j-sb']}>
        <h3>TODO</h3>
        <button onClick={() => {
          if (!showModal.value && selectedIndex.value !== null) {
            selectedIndex.value = null;
          }

          showModal.value = !showModal.value
        }}>
          <o-if rule={() => !showModal.value}>
            {{
              true: () => <>+</>,
              false: () => <>-</>
            }}
          </o-if>
        </button>
      </div>
      <o-if rule={() => showModal.value}>
        {{
          true: () => <ModalCreateTodo createTodo={createTodo} item={todos.value.find((e) => e.id === selectedIndex.value)} index={selectedIndex.value} o-if={true} />
        }}
      </o-if>
      <o-for items={notreadeTodo}>
        {
          (item, index) => <Todo 
            index={index + 1}
            id={item.id}
            title={item.title}
            doneTodo={doneTodo}
            deleteTodo={deleteTodo}
            done={item.done}
            descriptions={item.descriptions}
            edit={editFunc}
            />
        }
      </o-for>

      <o-if rule={() => readyTodo.value.length > 0}>
        <div o-if={true}>
          <o-if rule={() => notreadeTodo.value.length !== 0}>
            <hr o-if={true} />
          </o-if>
          <h3>Готовые задачи</h3>
          <div>
            <button type="checkbox" onClick={() => {
              todos.value.forEach((todo) => {
                if (todo.done) {
                  todo.done = false;
                }
              })
            }}>
              Все не готово
            </button>
          </div>
          <o-for items={readyTodo}>
            {
              (item, index) => <Todo 
              index={index + 1}
              id={item.id}
              title={item.title}
              doneTodo={doneTodo}
              deleteTodo={deleteTodo}
              done={item.done}
              descriptions={item.descriptions}
              edit={editFunc}
              />
            }
          </o-for>
        </div>
      </o-if>
    </div>
  )
}
```