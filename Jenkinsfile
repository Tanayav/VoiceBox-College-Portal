pipeline {
    agent any
    
    environment {
        // PLEASE UPDATE THESE VALUES
        registry = "192.168.20.250/vbx-app" 
        registryCredential = "nexus-credentials"
        kubeconfigId = "k8s-kubeconfig"
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
                container('dind') {
                    script {
                        withCredentials([usernamePassword(credentialsId: registryCredential, passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                            // Login to registry
                            sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} ${registry.split('/')[0]}"
                            
                            // Build and Push
                            sh "docker build -t ${registry}:${env.BUILD_ID} ."
                            sh "docker push ${registry}:${env.BUILD_ID}"
                            
                            // Push latest tag
                            sh "docker tag ${registry}:${env.BUILD_ID} ${registry}:latest"
                            sh "docker push ${registry}:latest"
                        }
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
