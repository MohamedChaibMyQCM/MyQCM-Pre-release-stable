import Choose_plan from '@/components/dashboard/settings/Choose_plan';
import Currently_plan from '@/components/dashboard/settings/Currently_plan';
import React from 'react'

const page = () => {
  return (
    <div className="px-6 mt-10 max-md:mt-10">
      <Currently_plan />
      <Choose_plan />
    </div>
  );
}

export default page