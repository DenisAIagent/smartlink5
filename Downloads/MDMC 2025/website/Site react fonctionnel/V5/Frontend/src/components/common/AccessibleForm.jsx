import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const AccessibleForm = ({
  schema,
  onSubmit,
  defaultValues = {},
  children,
  className,
  ariaLabel,
  ariaDescribedBy,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      noValidate
    >
      {typeof children === 'function'
        ? children({ register, errors, isSubmitting })
        : children}
    </form>
  );
};

// Composants de formulaire accessibles
export const AccessibleInput = ({
  label,
  name,
  type = 'text',
  register,
  error,
  required = false,
  placeholder,
  ariaLabel,
  ariaDescribedBy,
  className,
}) => {
  const inputId = `${name}-input`;
  const errorId = `${name}-error`;

  return (
    <div className={`form-group ${className || ''}`}>
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span className="required-mark" aria-hidden="true"> *</span>}
      </label>
      <input
        id={inputId}
        type={type}
        {...register(name)}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={error ? errorId : ariaDescribedBy}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
      />
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error.message}
        </div>
      )}
    </div>
  );
};

export const AccessibleTextarea = ({
  label,
  name,
  register,
  error,
  required = false,
  placeholder,
  ariaLabel,
  ariaDescribedBy,
  className,
  rows = 4,
}) => {
  const textareaId = `${name}-textarea`;
  const errorId = `${name}-error`;

  return (
    <div className={`form-group ${className || ''}`}>
      <label htmlFor={textareaId} className="form-label">
        {label}
        {required && <span className="required-mark" aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={textareaId}
        {...register(name)}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={error ? errorId : ariaDescribedBy}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        rows={rows}
      />
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error.message}
        </div>
      )}
    </div>
  );
};

export const AccessibleSelect = ({
  label,
  name,
  options,
  register,
  error,
  required = false,
  placeholder,
  ariaLabel,
  ariaDescribedBy,
  className,
}) => {
  const selectId = `${name}-select`;
  const errorId = `${name}-error`;

  return (
    <div className={`form-group ${className || ''}`}>
      <label htmlFor={selectId} className="form-label">
        {label}
        {required && <span className="required-mark" aria-hidden="true"> *</span>}
      </label>
      <select
        id={selectId}
        {...register(name)}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        aria-label={ariaLabel}
        aria-describedby={error ? errorId : ariaDescribedBy}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error.message}
        </div>
      )}
    </div>
  );
};

export const AccessibleButton = ({
  type = 'submit',
  children,
  isLoading = false,
  disabled = false,
  className,
  ariaLabel,
  ariaDescribedBy,
}) => {
  return (
    <button
      type={type}
      className={`btn ${className || ''}`}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span className="visually-hidden">Chargement...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default AccessibleForm; 