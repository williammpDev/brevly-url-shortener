import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './pages/Home/Home'
import { NotFound } from './pages/NotFound/NotFound'
import { Redirect } from './pages/Redirect/Redirect'

/**
 * Três rotas, como o enunciado descreve: a raiz com cadastro e listagem, a de
 * redirecionamento em `/:slug`, e qualquer outro endereço caindo em não
 * encontrado.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Redirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
