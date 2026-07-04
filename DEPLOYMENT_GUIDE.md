# Hospital Management System Deployment Guide

To deploy your MERN stack application on a **single platform** for free, the best approach is to deploy both the frontend and backend together as a **single unified Web Service** on [Render.com](https://render.com). 

I have already updated your codebase to support this:
- **Backend (`server.js`)**: Configured to serve the built frontend static files in production.
- **Frontend (`api.js`)**: Configured to use relative paths (`/api`) in production, so no extra frontend proxy configuration is needed.
- **Root (`package.json`)**: Added a unified `build` and `start` script to compile everything at once.

Follow these step-by-step instructions to get your app live.

## Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/).
2. Open your terminal in the project root directory and push your code:
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

## Step 2: Set up Render
1. Go to [Render.com](https://render.com/) and create a free account.
2. Click on the **New +** button in the dashboard and select **Web Service**.
3. Connect your GitHub account and select your newly created repository.

## Step 3: Configure the Web Service
Fill out the deployment configuration page with these exact details:

- **Name**: `hospital-management-system` (or whatever you prefer)
- **Region**: Select the region closest to your users
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Select the **Free** tier

## Step 4: Add Environment Variables
Scroll down to the **Environment Variables** section and click "Add Environment Variable". You need to add all the variables from your local `.env` file, but adjust them for the production cloud environment.

Make sure to include and adjust these specific variables:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | **CRITICAL:** This tells your Node server to serve the frontend! |
| `MONGO_URI` | `mongodb+srv://...` | Make sure you use a MongoDB Atlas cloud URI, not `localhost` |
| `CLIENT_URL` | `https://your-render-app-name.onrender.com` | Use your Render assigned URL |
| `GOOGLE_CALLBACK_URL` | `https://your-render-app-name.onrender.com/api/auth/google/callback` | Update this in your Google Cloud Console too! |
| `VITE_GOOGLE_CLIENT_ID` | `your-client-id.apps.googleusercontent.com` | From your frontend `.env` |

*(Don't forget to add all your other backend variables like `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, etc.)*

> **IMPORTANT**: If you are using Google OAuth, you **must** go to your [Google Cloud Console](https://console.cloud.google.com/) and add your new Render URL (`https://your-render-app-name.onrender.com/api/auth/google/callback`) to the **Authorized redirect URIs** section.

## Step 5: Deploy
1. Click the **Create Web Service** button at the bottom of the page.
2. Render will now download your code, run `npm run build` (which installs all dependencies and builds the Vite frontend), and then run `npm start` (which starts your Express backend server).
3. Wait a few minutes for the build process to finish. Once the status shows as **"Live"**, click the web URL at the top left of your Render dashboard.

Your entire full-stack application is now hosted and running on a single platform!
