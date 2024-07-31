import Statistical from '@/components/dashboard/Home/Statistical'
import Welcome from '@/components/dashboard/Home/Welcome'
import React from 'react'

const page = () => {
  return (
    <div className='flex items-center'>
      <Welcome />
      <Statistical />
    </div>
  )
}

export default page