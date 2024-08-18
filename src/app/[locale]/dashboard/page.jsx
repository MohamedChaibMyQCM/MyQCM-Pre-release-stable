import Statistical from '@/components/dashboard/Home/Statistical'
import Welcome from '@/components/dashboard/Home/Welcome'
import React from 'react'

const page = () => {
  return (
    <div className='flex'>
      <Welcome />
      <Statistical />
    </div>
  )
}

export default page