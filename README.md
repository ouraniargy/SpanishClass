# Spanish Class Booking System - SpanishClass

## Application Description

A web application for managing Spanish language classes, built with ASP.NET Core (backend) and React (frontend).
This application is a complete booking system for Spanish language classes. Its goal is to facilitate both students and professors
in managing lessons, schedules and reservations.

The system supports three main user roles:

- Professor
- Student
- Admin

Each role has different functionalities tailored to their needs.

## System objectives

- Organize and manage lessons by professors
- Allow students to browse available classes
- Enable booking of class seats
- Improve the overall learning process
- Coordinate schedules between professors

## Use cases

• Professor:

- Register and log in to the system
- Create and manage classes
- View personal schedule
- View other professors’ schedules
- Search bookings based on criteria (e.g., lesson name, id)
- Create and manage lessons
- Create and manage levels
- Record student attendance (e.g., mark present/absent or scan check-ins)

• Student:

- Register and log in to the system
- View available classes
- Book a seat in a class
- View and manage their bookings
- Search bookings based on criteria (e.g., lesson name or booking ID)

• Admin:

- Manage roles (students and professors)

## System Architecture

The application follows a client-server architecture.

Backend

- Language: C#
- Framework ASP.NET Core
- Architecture: MVC (Model-View-Controller)
- ORM: Entity Framework Core
- API Documentation: Swagger (OpenAPI)

Frontend

- Library: React
- Technologies: HTML, CSS, JavaScript

Database

- System PostgreSQL

# Usage Instructions

Prerequisites

To run this application, make sure you have the following installed:
• Visual Studio (with .NET workload installed)
• .NET SDK (version 6.0 or 7.0 recommended)
• Node.js (version 16.x or higher)
• npm (comes with Node.js)
• Visual Studio Code (optional, for frontend development)

## Clone or download the project

### `git clone https://github.com/ouraniargy/SpanishClass.git`

## Backend Setup and Run (C# / .NET)

1. Open the backend folder in Visual Studio named SpanishClass

2. Restore the dependencies from terminal

### `dotnet restore`

3. Run the application from terminal:

### `dotnet run`

or use the Run button in Visual Studio. 4. The backend will typically start at: https://localhost:7185/

## Frontend Setup and Run (React)

1. Navigate to the frontend folder (/Client):

### `cd client`

2. Install all required dependencies:

### `npm install`

3. Start the application:

### `npm start`

4. The frontend will be available at: http://localhost:3000/

## Notes

- The backend must be running before starting the frontend
- You may need to accept the SSL certificate for localhost
- If you encounter errors, ensure that the required ports are not already in use

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
