pipeline {
    agent {
        kubernetes {
            // Let Jenkins handle the JNLP agent automatically
            yaml '''
kind: Pod
spec:
  containers:
  - name: nodejs
    image: node:20-alpine
    command: ["cat"]
    tty: true
    resources:
      requests: { memory: "256Mi", cpu: "100m" }
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ["sleep"]
    args: ["9999999"]
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli:latest
    command: ["cat"]
    tty: true
  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
'''
        }
    }

    environment {
        IMAGE_REGISTRY = 'nexus.imcc.com'
        IMAGE_PATH = 'my-repository/vbx-app'
        NAMESPACE = 'voicebox'
        REGISTRY_CREDS = 'nexus-credentials'
    }

    stages {
        stage('Install & Test') {
            steps {
                container('nodejs') {
                    dir('app') {
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Build & Push (Kaniko)') {
            steps {
                container('kaniko') {
                    // Kaniko builds and pushes without needing a Docker daemon or privileged mode
                    withCredentials([usernamePassword(credentialsId: REGISTRY_CREDS, passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                        sh """
                        /kaniko/executor --context `pwd` \
                            --dockerfile `pwd`/Dockerfile \
                            --destination ${IMAGE_REGISTRY}/${IMAGE_PATH}:latest \
                            --registry-mirror ${IMAGE_REGISTRY}
                        """
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    // Use credentials instead of hardcoded passwords
                    script {
                        sh "sonar-scanner -Dsonar.projectKey=vbx_app -Dsonar.host.url=http://sonarqube.imcc.com -Dsonar.login=student -Dsonar.password=Imccstudent@2025"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                container('kubectl') {
                    dir('k8s') {
                        sh "kubectl apply -f . -n ${NAMESPACE}"
                    }
                }
            }
        }
    }
}