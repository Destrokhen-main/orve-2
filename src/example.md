```javascript
import { ref, computedEffect } from "orve-rxjs"

function CreateToDoComponent({ createCallBack }) {
  const inp1 = ref("a");
  const inp2 = ref("a");

  const click = () => {
    createCallBack(inp1.value, inp2.value)
  }

  return (
    <div>
      <div>
        <label for="inp-1">Имя задачи</label><br />
        <input id="inp-1" value={inp1} onInput={(e) => inp1.value = e.target.value}/>
      </div>
      <div>
        <label for="inp-2">Описание</label><br />
        <textarea id="inp-2" value={inp2} onInput={(e) => inp2.value = e.target.value}></textarea>
      </div>
      <div>
        <button onClick={click}>Создать</button>
      </div>
    </div>
  )
}

function ListToDo({ list, del }) {
  return (
    <>
      <o-if rule={() => list.value.length > 0}>
        {{
          true: () => (
            <div>
              <o-for items={list}>
                {(item, index) => {
                  return (
                    <div>
                      <h4>[ {index + 1} ] - { item.title }</h4>
                      <p>{ item.desc }</p>
                      <button onClick={() => del(index)}>Delete</button>
                    </div>
                  )
                }}
              </o-for>
            </div>
          ),
          else: () => <div>Список Пуст</div>
        }}
      </o-if>
    </>
  )
}


export default function App() {
  this.id = '1'

  const listToDo = ref([{ title: "a", desc: "a" }]);

  const message = ref("");
  const ErrorMessage = (mess) => {
    console.log('asd', mess);
    message.value = mess;

    setTimeout(() => {
      message.value = "";
    }, 2000)
  }

  const createTodo = (title, desc) => {
    const existItem = listToDo.value.find((e) => e.title === title)
    if (existItem === undefined) {
      listToDo.value.push({ title, desc })
    } else {
      ErrorMessage("Уже такой есть")
    }
  } 

  const deleteTask = (id) => {
    listToDo.value.splice(id, 1)
  }

  const items = computedEffect(() => listToDo.value.filter((e) => e.desc === 'a'))
  return (
    <>
      <div>
        <o-for items={items}>
          {(item, index) => {
            return <div>{index} {item.desc}</div>
          }}
        </o-for>
      </div>
      <o-if rule={() => message.value.length > 0}>
        <span o-if={true}>
          {message}
        </span>
      </o-if>
      <CreateToDoComponent createCallBack={createTodo} />
      <hr />
      <ListToDo list={listToDo} del={deleteTask} />
    </>
  )
}
```