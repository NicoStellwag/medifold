
import React from 'react';
import { Check } from 'lucide-react';

export const CelebrationAnimation = () => {
  return (
    <div className="flex justify-center mb-6">
      <div className="animate-celebrate bg-medifold-primary h-20 w-20 rounded-full flex items-center justify-center">
        <Check className="text-white h-10 w-10" />
      </div>
    </div>
  );
};
