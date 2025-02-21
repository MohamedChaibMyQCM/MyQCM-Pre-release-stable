import React from 'react'
import Stren_Weakn from './Stren_Weakn';
import Study_time from './Study_time';
import Total_Point from './Total_Point';
import Ranking from './Ranking';

const Strength_Stat = () => {
  return (
    <div className='flex mt-8 gap-6'>
      <Stren_Weakn />
      <Study_time />
      <div className='flex flex-col'>
        <Total_Point />
        <Ranking />
      </div>
    </div>
  );
}

export default Strength_Stat