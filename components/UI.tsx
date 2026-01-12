import React, { useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 py-2',
    lg: 'h-10 px-8'
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props} 
    />
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, error, ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      <input 
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-destructive focus-visible:ring-destructive' : '',
          className
        )} 
        {...props} 
      />
      {error && <p className="text-[0.8rem] text-destructive font-medium">{error}</p>}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; childrenClassNames?: string; title?: string; actions?: React.ReactNode }> = ({ children, className, childrenClassNames, title, actions }) => {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {(title || actions) && (
        <div className="flex flex-col space-y-1.5 p-4 pb-2">
           <div className="flex items-center justify-between">
              {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
              {actions && <div className="flex gap-2">{actions}</div>}
           </div>
        </div>
      )}
      <div className={cn("p-2 pt-2 h-full flex flex-col", childrenClassNames)}>{children}</div>
    </div>
  );
};

interface CodeEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  readOnly?: boolean;
  actions?: React.ReactNode;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ className, label, readOnly, actions, ...props }) => {
  return (
    <div className="flex flex-col h-full w-full space-y-2">
      {(label || actions) && (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                {label && <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>}
                {readOnly && label && <span className="text-[10px] uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">Read-only</span>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <textarea
        className={cn(
          "flex-1 w-full min-h-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          readOnly ? "bg-muted opacity-80 cursor-default" : "",
          className
        )}
        spellCheck={false}
        readOnly={readOnly}
        {...props}
      />
    </div>
  );
};

interface SyntaxHighlightProps {
    code: string;
    language: string;
    className?: string;
}

declare global {
  interface Window {
    Prism: any;
  }
}

export const SyntaxHighlight: React.FC<SyntaxHighlightProps> = ({ code, language, className }) => {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (window.Prism && codeRef.current) {
            window.Prism.highlightElement(codeRef.current);
        }
    }, [code, language]);

    return (
        <pre className={cn("flex-1 w-full h-full rounded-md border border-input bg-[#2d2d2d] text-white p-4 text-sm font-mono shadow-sm overflow-auto", className)}>
            <code ref={codeRef} className={`language-${language}`}>
                {code}
            </code>
        </pre>
    );
};