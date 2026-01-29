'use client';

import React from 'react';
import { ClockLoader, SyncLoader } from 'react-spinners';
import Image from 'next/image';
import appConfig from '@/settings';

interface LoaderProps {
  size?: number;
  fullScreen?: boolean;
  message?: string;
  className?: string;
  inline?: boolean;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 16,
  fullScreen = false,
  message,
  className = '',
  inline = false,
  color
}) => {
  const loaderColor = color || appConfig.primaryColor;
  
  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="relative" 
          style={{ 
            width: size * 2.5, 
            height: size * 2.5,
            backgroundColor: loaderColor,
            WebkitMaskImage: `url(${appConfig.sidebarClearlogoUrl})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(${appConfig.sidebarClearlogoUrl})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
        <ClockLoader 
          color={loaderColor}
          size={size}
          loading={true}
        />
      </div>
    );
  }

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Image armoirie avec couleur du loader */}
      <div 
        className="relative mb-4" 
        style={{ 
          width: size * 10, 
          height: size * 10,
          backgroundColor: loaderColor,
          WebkitMaskImage: `url(${appConfig.sidebarClearlogoUrl})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(${appConfig.sidebarClearlogoUrl})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />
      <SyncLoader  
        color={loaderColor}
        size={size}
        loading={true}
      />
      {message && (
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;