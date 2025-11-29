# Frontend Developer Guide

This guide provides detailed information for developers working on the Smart Funeral System frontend.

## Architecture Overview

The Smart Funeral System frontend is built with:

- **React**: UI component library
- **React Router**: Client-side routing
- **Context API**: State management, particularly for authentication
- **Tailwind CSS**: Utility-first styling
- **CSS Modules**: Component-specific styling
- **Vite**: Build tool and development server

## Component Structure

### Page Components

Located in `src/pages/`, these represent full pages in the application:

- **Home.jsx**: Landing page with featured services
- **About.jsx**: About the platform
- **Login.jsx**: User login page
- **Register.jsx**: User registration
- **ServiceProvider.jsx**: Browse service providers
- **ProviderDetails.jsx**: Detailed view of a specific provider
- **PackageDetails.jsx**: Detailed view of a funeral package
- **ServiceProviderDashboard.jsx**: Dashboard for service providers
- **ManagePackages.jsx**: CRUD operations for provider packages
- **TributeHome.jsx**: Browse memorial tributes
- **TributePage.jsx**: Individual tribute page
- **TributeCreate.jsx**: Create a new tribute
- **FAQs.jsx**: Frequently asked questions

### Shared Components

Located in `src/components/`, these are reusable UI elements:

- **Layout.jsx**: Common layout with navigation and footer
- **Navbar.jsx**: Top navigation bar
- **Footer.jsx**: Page footer
- **Button.jsx**: Styled button component
- **ProtectedRoute.jsx**: Route wrapper for authentication
- **UI Components**: Various basic UI elements in `src/components/ui/`

## Authentication Flow

Authentication is managed through the `AuthContext` in `src/AuthContext.jsx`:

1. **Login Process**:
   ```javascript
   const { login } = useAuth();
   
   const handleLogin = async (username, password) => {
     try {
       await login(username, password);
       // Redirect on success
     } catch (error) {
       // Handle login failure
     }
   };
   ```

2. **Authentication State**:
   ```javascript
   const { isAuthenticated, user } = useAuth();
   
   // Conditionally render based on auth state
   return (
     <div>
       {isAuthenticated ? (
         <p>Welcome, {user.username}!</p>
       ) : (
         <p>Please log in</p>
       )}
     </div>
   );
   ```

3. **Protected Routes**:
   ```javascript
   // In App.jsx
   <Route 
     path="/provider-dashboard" 
     element={
       <ProtectedRoute requiredRole="provider">
         <ServiceProviderDashboard />
       </ProtectedRoute>
     } 
   />
   ```

## API Integration

API calls are centralized in `src/api.js`. The backend endpoints are PHP files that return JSON responses.

Example API function:

```javascript
export const getPackages = async (providerId = null) => {
  try {
    const url = providerId 
      ? `/backend/getPackages.php?provider_id=${providerId}`
      : '/backend/getPackages.php';
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch packages');
    }
    
    return data.packages;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};
```

For authenticated requests:

```javascript
export const getProviderProfile = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/backend/getProviderProfile.php', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Process response...
  } catch (error) {
    // Handle error...
  }
};
```

## Common Patterns

### Data Fetching

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await someApiFunction();
      setData(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

// In JSX
{loading && <p>Loading...</p>}
{error && <p className="text-red-500">{error}</p>}
{!loading && !error && (
  <div>
    {/* Render data */}
  </div>
)}
```

### Forms

```jsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  
  try {
    await submitFormData(formData);
    setSuccess('Form submitted successfully!');
    setFormData({ field1: '', field2: '' }); // Reset form
  } catch (error) {
    setError(error.message || 'Form submission failed');
  }
};
```

### Role-Based Rendering

```jsx
const { user } = useAuth();

return (
  <div>
    {user?.role === 'provider' && (
      <div className="provider-controls">
        {/* Provider-only controls */}
      </div>
    )}
    
    {user?.role === 'family' && (
      <div className="family-controls">
        {/* Family-only controls */}
      </div>
    )}
    
    {/* Content visible to all */}
  </div>
);
```

## Page Templates

### Basic Page Template

```jsx
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { someApiFunction } from '../api';

const PageName = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await someApiFunction();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Page Title</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {/* Content goes here */}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PageName;
```

### Form Page Template

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { submitFormFunction } from '../api';

const FormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await submitFormFunction(formData);
      navigate('/success-page');
    } catch (error) {
      setError(error.message || 'An error occurred');
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Form Title</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Field 1</label>
            <input
              type="text"
              name="field1"
              value={formData.field1}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Field 2</label>
            <input
              type="text"
              name="field2"
              value={formData.field2}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default FormPage;
```

## Best Practices

1. **State Management**:
   - Use local state for component-specific data
   - Use context for global state (auth, theme)
   - Keep state as close as possible to where it's used

2. **Component Organization**:
   - Single responsibility components
   - Extract reusable logic into custom hooks
   - Keep components under 250 lines of code

3. **Performance**:
   - Use React.memo() for pure components
   - Use proper dependency arrays in hooks
   - Avoid excessive re-renders

4. **Error Handling**:
   - Always handle API errors
   - Provide user-friendly error messages
   - Use try/catch blocks for async operations

5. **Styling**:
   - Use Tailwind for layout and common styling
   - Use CSS modules for complex component-specific styles
   - Maintain consistent spacing and color schemes

6. **Security**:
   - Always validate user input
   - Never store sensitive data in localStorage
   - Handle auth tokens securely

## Development Workflow

1. **Create a new feature**:
   - Add any necessary API functions to `api.js`
   - Create or modify components as needed
   - Update routes in `App.jsx` if creating new pages
   - Test the feature thoroughly

2. **Fix a bug**:
   - Identify the source of the bug
   - Make minimal necessary changes
   - Test to ensure the bug is fixed
   - Verify no regressions were introduced

3. **Review code**:
   - Ensure code follows project patterns
   - Check for any potential security issues
   - Verify proper error handling
   - Test across different screen sizes