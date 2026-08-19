import { BoardView } from './components/BoardView'
import styles from './App.module.css'

function App() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>タスクボード</h1>
      </header>
      <BoardView />
    </>
  )
}

export default App
