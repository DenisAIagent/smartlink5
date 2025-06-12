import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';

const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { showError } = useNotification();

  const validateField = useCallback(
    (name, value) => {
      const fieldValidation = validationSchema[name];
      if (!fieldValidation) return '';

      if (fieldValidation.required && !value) {
        return fieldValidation.required;
      }

      if (fieldValidation.pattern && !fieldValidation.pattern.test(value)) {
        return fieldValidation.pattern.message;
      }

      if (fieldValidation.minLength && value.length < fieldValidation.minLength.value) {
        return fieldValidation.minLength.message;
      }

      if (fieldValidation.maxLength && value.length > fieldValidation.maxLength.value) {
        return fieldValidation.maxLength.message;
      }

      if (fieldValidation.min && Number(value) < fieldValidation.min.value) {
        return fieldValidation.min.message;
      }

      if (fieldValidation.max && Number(value) > fieldValidation.max.value) {
        return fieldValidation.max.message;
      }

      if (fieldValidation.validate) {
        const customError = fieldValidation.validate(value, values);
        if (customError) return customError;
      }

      return '';
    },
    [validationSchema, values]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === 'checkbox' ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      if (touched[name]) {
        const error = validateField(name, newValue);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e.preventDefault();

      // Valider tous les champs
      const newErrors = {};
      Object.keys(validationSchema).forEach((name) => {
        const error = validateField(name, values[name]);
        if (error) {
          newErrors[name] = error;
        }
      });

      setErrors(newErrors);
      setTouched(
        Object.keys(validationSchema).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      );

      if (Object.keys(newErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          showError(error.message || 'Une erreur est survenue');
        }
      }
    },
    [values, validationSchema, validateField, showError]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, values[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, [validateField, values]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldTouched,
    isValid: Object.keys(errors).length === 0,
  };
};

export default useForm; 