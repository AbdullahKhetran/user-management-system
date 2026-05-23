# Frontend

React + Vite application for user management with pagination and status toggling. Visit the Live [application](https://metavystic-task-frontend.vercel.app/)

## Technology Stack

- React 19
- Vite
- Axios for API calls
- Deployed on Vercel

## Features

- User List: Paginated display with cursor-based navigation
- Sorting: Sort by ID or age (ascending/descending) 
- Email Filter: Search users by exact email match 
- Status Toggle: Activate/deactivate users with visual feedback

##  Components

- Users.jsx: Main component with state management for pagination, sorting, and user operations


Note:
The frontend uses the +1 trick pagination strategy where it requests limit + 1 records to determine if more data exists without a separate COUNT query