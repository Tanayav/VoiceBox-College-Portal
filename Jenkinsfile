pipeline {
    agent {
        kubernetes {
            inheritFrom 'default'
            yaml '''
kind: Pod
spec:
  hostAliases:
  - ip: "192.168.20.250"
    hostnames:
    - "nexus.imcc.com"
  - ip: "192.168.20.251"
    hostnames:
    - "sonarqube.imcc.com"
'''
        }
    }
    
    environment {
        // PLEASE UPDATE THESE VALUES
        registry = "nexus.imcc.com/vbx-app" 
        registryCredential = "nexus-credentials"
        kubeconfigId = "k8s-kubeconfig"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                container('jnlp') {
                    echo 'Building application...'
                    // Actual build happens in Docker stage, this is a placeholder
                    // or could be used for unit tests if environment allows
                }
            }
        }

        stage('Analyze') {
            steps {
                container('jnlp') {
                    script {
                        // Assuming standard scanner installation name 'SonarQubecanner' or similar
                        // If this name is wrong, it will fail. Trying standard fallback path.
                        def scannerHome = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        withSonarQubeEnv('SonarQube') { 
                            sh "${scannerHome}/bin/sonar-scanner"
                        }
                    }
                }
            }
        }

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
