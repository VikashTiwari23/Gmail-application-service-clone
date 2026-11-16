
import HomePage from './HomePage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Inbox from './Inbox'
import Sent from './Sent'
import Draft from './Draft'
import Trash from './Trash'
import ComposeMail from './ComposeMail'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage/>}>
            <Route index element={<Navigate to="/inbox" replace />} />
            <Route path="inbox" element={<Inbox/>} />
            <Route path="sent" element={<Sent/>} />
            <Route path="draft" element={<Draft/>} />
            <Route path="trash" element={<Trash/>} />
            <Route path="compose" element={<ComposeMail/>} />
            <Route path="*" element={<Navigate to="/inbox" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
