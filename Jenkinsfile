pipeline {
    agent any
    
    environment {
        // PLEASE UPDATE THESE VALUES
        registry = "your-registry-url/vbx-app" 
        registryCredential = "nexus-credentials-id"
        kubeconfigId = "k8s-kubeconfig-id"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Stages for explicit npm install/build removed to rely on Docker multi-stage build
        // This avoids "npm not found" errors on the Jenkins agent


        stage('Docker Build & Push') {
            steps {
                script {
                    docker.withRegistry('', registryCredential) {
                         // Build using the Dockerfile in the root, context is root
                         def customImage = docker.build(registry + ":${env.BUILD_ID}")
                         customImage.push()
                         customImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: kubeconfigId]) {
                    sh 'kubectl apply -f k8s/'
                    // Force update the image to the new tag
                    sh "kubectl set image deployment/vbx-deployment vbx-container=${registry}:${env.BUILD_ID} --record"
                    // Verify deployment
                    sh "kubectl rollout status deployment/vbx-deployment"
                }
            }
        }
    }
}
