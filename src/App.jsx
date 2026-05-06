import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CharacterSelect from './pages/CharacterSelect'
import Scene from './pages/Scene'
import Experience from './pages/Experience'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/characters" element={<CharacterSelect />} />
      <Route path="/scenes/:characterId" element={<Scene />} />
      <Route path="/experience/:characterId/:sceneId" element={<Experience />} />
    </Routes>
  )
}
