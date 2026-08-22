import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './pages/Home/Home'
import { NotFound } from './pages/NotFound/NotFound'

/**
 * Três rotas, como o enunciado descreve: a raiz com cadastro e listagem, a de
 * redirecionamento (Issue #26) e qualquer outro endereço caindo em não
 * encontrado.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
