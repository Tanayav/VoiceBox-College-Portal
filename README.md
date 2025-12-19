# VBX Project

This project uses **React + Vite** and is structured for automated CI/CD deployment using **Jenkins, Docker, and Kubernetes**.

## Project Structure

```
project-root/
│── app/                  # Application source code (React + Vite)
│── Dockerfile            # Multi-stage Docker build
│── Jenkinsfile           # CI/CD Pipeline definition
│── k8s/                  # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│── README.md             # This documentation
```

## Setup & Deployment

1. **Development**:
   - Navigate to `app/` directory: `cd app`
   - Install dependencies: `npm install`
   - Run dev server: `npm run dev`

2. **Docker Build (Local Testing)**:
   - Build image: `docker build -t vbx-app .`
   - Run container: `docker run -p 80:80 vbx-app`
   - Visit `http://localhost:80`

3. **CI/CD Pipeline (Jenkins)**:
   - Push code to GitHub.
   - Jenkins will automatically:
     - Build the application.
     - Create a Docker image.
     - Push the image to the registry.
     - Deploy to Kubernetes using the manifests in `k8s/`.
