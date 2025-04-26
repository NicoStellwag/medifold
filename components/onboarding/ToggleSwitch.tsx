
import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export const ToggleSwitch = ({
  id,
  label,
  description,
  isChecked,
  onChange,
  icon
}: ToggleSwitchProps) => {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-medifold-soft/30 transition-colors">
      {icon && <div className="mt-0.5 text-medifold-secondary">{icon}</div>}
      
      <div className="flex-grow">
        <label htmlFor={id} className="text-base font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        id={id}
        onClick={() => onChange(!isChecked)}
        className={`onboarding-toggle ${isChecked ? 'onboarding-toggle-active' : ''} 
        relative inline-flex flex-shrink-0 transition-colors duration-200 ease-in-out`}
      >
        <span className={`${isChecked ? 'translate-x-5' : 'translate-x-0'} 
          inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out`} 
        />
      </button>
    </div>
  );
};
