// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Ministries from './pages/Ministries'
import Resources from './pages/Resources'
import Join from './pages/Join'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/join" element={<Join />} />
      </Routes>
    </Layout>
  )
}

export default App