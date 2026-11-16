import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const HomePage = () => {
  return (
    <div  className='min-h-screen w-full bg-zinc-100 text-zinc-100 flex overflow-hidden'>
      <Navbar />
      <div className='flex-1 flex-col min-w-0'>
        <header className='h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10'>
          <span className='text-xs uppercase tracking-widest text-zinc-500 font-medium'>Workspace</span>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400" title="Connected" />
            <span className="text-xs text-zinc-400">Gmail Microservices</span>
          </div>
        </header>
        <main className='flex-1 min-w-0 bg-wheat'>
           <Outlet/>
        </main>
      </div>
    </div>
  )
}

export default HomePage
