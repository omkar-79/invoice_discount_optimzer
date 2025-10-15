import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { parseApiError, formatErrorMessage } from '@/lib/error-handler';

/**
 * Custom hook for handling form errors and API calls with consistent error handling
 */
export function useFormError() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, context?: string) => {
    const errorMessage = formatErrorMessage(error, context);
    setError(errorMessage);
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }, [toast]);

  const handleSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title,
      description: message,
      variant: "success",
    });
  }, [toast]);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      handleError(error, context);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    clearError,
    handleError,
    handleSuccess,
    executeWithErrorHandling,
    setError,
    setIsLoading,
  };
}
