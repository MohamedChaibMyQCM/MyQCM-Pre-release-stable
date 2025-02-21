import Learning_calender from '@/components/dashboard/MyProgress/Learning_calender'
import Performance from '@/components/dashboard/MyProgress/Performance'
import Progress_per_module from '@/components/dashboard/MyProgress/Progress_per_module'
import Recent_Quiz from '@/components/dashboard/MyProgress/Recent_Quiz'
import React from 'react'

const page = () => {
  return (
    <div className='px-6 mt-8'>
      <div className='flex items-center gap-6'>
        <Progress_per_module />
        <Performance />
        <Recent_Quiz />
      </div>
      <Learning_calender />
    </div>
  )
}

export default page