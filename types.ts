import React, { ReactNode } from 'react';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: ReactNode;
  category: 'formatters' | 'converters' | 'generators' | 'utilities';
}

export interface NavItem {
  name: string;
  path: string;
  icon: React.FC<any>;
}

export type Theme = 'light' | 'dark';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
  column?: number;
}