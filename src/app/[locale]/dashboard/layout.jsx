import Aside from '@/components/dashboard/Aside'
import React from 'react'

const layout = ({children}) => {
  return (
    <main>
      <Aside />
      <div className='ml-60 '>
        {children}
      </div>
    </main>
  )
}

export default layout