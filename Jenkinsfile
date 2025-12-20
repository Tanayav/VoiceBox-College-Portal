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
  containers:
  - name: nodejs
    image: node:22-alpine
    command:
    - cat
    tty: true
  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    args:
    - --insecure-registry=nexus.imcc.com
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
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Test') {
            steps {
                container('nodejs') {
                    dir('app') {
                        sh 'npm install'
                        // sh 'npm test' // Uncomment if tests exist
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    script {
                        withCredentials([usernamePassword(credentialsId: registryCredential, passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                            sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} ${registry.split('/')[0]}"
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh "docker build -t ${registry}:${env.BUILD_ID} ."
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('jnlp') {
                    script {
                        // Assuming standard scanner installation
                        def scannerHome = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        withSonarQubeEnv('SonarQube') { 
                            sh "${scannerHome}/bin/sonar-scanner"
                        }
                    }
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    // Tagging and Pushing
                    sh "docker push ${registry}:${env.BUILD_ID}"
                    sh "docker tag ${registry}:${env.BUILD_ID} ${registry}:latest"
                    sh "docker push ${registry}:latest"
                }
            }
        }

        stage('Deploy Application') {
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
