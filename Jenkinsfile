pipeline {
    agent {
        kubernetes {
            inheritFrom ''
            yaml '''
kind: Pod
metadata:
  labels:
    some-label: some-value
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:3148.v532a_7e715ee3-1
    args: ['\$(JENKINS_SECRET)', '\$(JENKINS_NAME)']
    resources:
      requests:
        memory: "64Mi"
        cpu: "10m"
      limits:
        memory: "256Mi"
        cpu: "500m"
  - name: nodejs
    image: public.ecr.aws/docker/library/node:22-alpine
    command:
    - cat
    tty: true
    resources:
      requests:
        memory: "32Mi"
        cpu: "5m"
      limits:
        memory: "256Mi"
        cpu: "200m"
  - name: dind
    image: public.ecr.aws/docker/library/docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    command:
    - dockerd
    - --host=unix:///var/run/docker.sock
    - --host=tcp://0.0.0.0:2375
    - --insecure-registry=0.0.0.0/0
    resources:
      requests:
        memory: "64Mi"
        cpu: "10m"
      limits:
        memory: "512Mi"
        cpu: "500m"
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli:latest
    command:
    - cat
    tty: true
    resources:
      requests:
        memory: "32Mi"
        cpu: "5m"
      limits:
        memory: "256Mi"
        cpu: "250m"
  - name: kubectl
    image: public.ecr.aws/bitnami/kubectl:latest
    command:
    - cat
    tty: true
    securityContext:
      runAsUser: 0
    resources:
      requests:
        memory: "32Mi"
        cpu: "5m"
      limits:
        memory: "128Mi"
        cpu: "100m"
'''
        }
    }

    environment {
        // Project Specific Configs
        IMAGE_REGISTRY = 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'
        IMAGE_PATH = 'my-repository/vbx-app'
        NAMESPACE = 'jenkins'
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
                        // sh 'npm test' 
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    // Check for docker daemon readiness
                    sh '''
                        timeout=60
                        while ! docker info > /dev/null 2>&1; do
                            if [ $timeout -le 0 ]; then
                                echo "Timed out waiting for Docker daemon"
                                exit 1
                            fi
                            echo "Waiting for docker daemon..."
                            sleep 1
                            timeout=$((timeout - 1))
                        done
                    '''
                    // Login using the internal registry address
                    withCredentials([usernamePassword(credentialsId: registryCredential, passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} ${IMAGE_REGISTRY}"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    // Build explicitly tagging latest
                    sh "docker build -t ${IMAGE_REGISTRY}/${IMAGE_PATH}:${env.BUILD_ID} ."
                    sh "docker tag ${IMAGE_REGISTRY}/${IMAGE_PATH}:${env.BUILD_ID} ${IMAGE_REGISTRY}/${IMAGE_PATH}:latest"
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     script {
                        // Use the internal URL found in the reference
                        sh "sonar-scanner -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 -Dsonar.login=student -Dsonar.password=Imccstudent@2025"
                    }
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    sh "docker push ${IMAGE_REGISTRY}/${IMAGE_PATH}:${env.BUILD_ID}"
                    sh "docker push ${IMAGE_REGISTRY}/${IMAGE_PATH}:latest"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: kubeconfigId, variable: 'KUBECONFIG')]) {
                        script {
                             sh """
                                # Apply manifests
                                # Update image in deployment if needed (though usually handled by tags if manifest uses latest, or set image)
                                
                                # Create namespace if not exists (dry-run trick)
                                kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                                
                                # Force delete old deployment to clear stuck/zombie pods (Reference Logic)
                                kubectl delete deployment vbx-deployment -n ${NAMESPACE} --ignore-not-found=true
                                
                                # Apply manifests
                                kubectl apply -f k8s/ -n ${NAMESPACE}
                                
                                # Force update image to current build ID
                                kubectl set image deployment/vbx-deployment vbx-container=${IMAGE_REGISTRY}/${IMAGE_PATH}:${env.BUILD_ID} -n ${NAMESPACE} --record
                                
                                # Wait for rollout
                                if kubectl rollout status deployment/vbx-deployment -n ${NAMESPACE} --timeout=5m; then
                                    echo "Rollout successful!"
                                else
                                    echo "Rollout failed. Debugging..."
                                    kubectl get pods -n ${NAMESPACE}
                                    kubectl describe deployment vbx-deployment -n ${NAMESPACE}
                                    kubectl describe pods -n ${NAMESPACE}
                                    exit 1
                                fi
                            """
                        }
                    }
                }
            }
        }
    }
}
