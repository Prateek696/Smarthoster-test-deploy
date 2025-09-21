import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchPropertiesAsync } from '../store/properties.slice';

/**
 * Custom hook to listen for property deletion events and refresh property lists
 * This ensures that when a property is deleted from any component,
 * all property dropdowns and lists are updated across the app
 */
export const usePropertyRefresh = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handlePropertyDeleted = (event: CustomEvent) => {
      console.log('🔄 Property deleted globally, refreshing all property lists:', event.detail);
      // Refresh the main properties list
      dispatch(fetchPropertiesAsync());
    };

    // Listen for property deletion events
    window.addEventListener('propertyDeleted', handlePropertyDeleted as EventListener);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('propertyDeleted', handlePropertyDeleted as EventListener);
    };
  }, [dispatch]);
};

export default usePropertyRefresh;
