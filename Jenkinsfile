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
    image: jenkins/inbound-agent:latest-jdk17
    args: ['\$(JENKINS_SECRET)', '\$(JENKINS_NAME)']
    readinessProbe:
      exec:
        command:
        - "true"
      initialDelaySeconds: 5
      periodSeconds: 10
    resources:
      requests:
        memory: "16Mi"
        cpu: "2m"
      limits:
        memory: "256Mi"
        cpu: "500m"
  - name: nodejs
    image: public.ecr.aws/docker/library/node:22-alpine
    command:
    - cat
    tty: true
    readinessProbe:
      exec:
        command:
        - "true"
      initialDelaySeconds: 5
      periodSeconds: 10
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
    readinessProbe:
      tcpSocket:
        port: 2375
      initialDelaySeconds: 5
      periodSeconds: 10
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
    readinessProbe:
      exec:
        command:
        - "true"
      initialDelaySeconds: 5
      periodSeconds: 10
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
    readinessProbe:
      exec:
        command:
        - "true"
      initialDelaySeconds: 5
      periodSeconds: 10
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
        IMAGE_REGISTRY = 'nexus.imcc.com'
        IMAGE_PATH = 'my-repository/vbx-app'
        NAMESPACE = 'voicebox'
        registryCredential = "nexus-credentials"
        kubeconfigId = "k8s-kubeconfig"
    }

    stages {
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
                    sh 'docker --version'
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
                    sh "docker build -t vbx-app:latest ."
                    sh "docker image ls"
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     script {
                        sh """
                        sonar-scanner \
                            -Dsonar.projectKey=vbx_app_project \
                            -Dsonar.host.url=http://sonarqube.imcc.com \
                            -Dsonar.login=student \
                            -Dsonar.password=Imccstudent@2025 \
                            -Dsonar.sources=. \
                             -Dsonar.exclusions=**/node_modules/**,**/dist/**
                        """
                    }
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    sh "docker tag vbx-app:latest ${IMAGE_REGISTRY}/${IMAGE_PATH}:latest"
                    sh "docker push ${IMAGE_REGISTRY}/${IMAGE_PATH}:latest"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: kubeconfigId, variable: 'KUBECONFIG')]) {
                        script {
                            dir('k8s') {
                                sh """
                                    # ===== DEBUG: Find Nexus IP =====
                                    echo "=== Looking for Nexus Service IP ==="
                                    kubectl get svc -n nexus || true
                                    kubectl get svc -A | grep nexus || true
                                    
                                    # Create namespace if not exists
                                    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                                    
                                    # Force delete old deployment to clear stuck/zombie pods
                                    kubectl delete deployment vbx-deployment -n ${NAMESPACE} --ignore-not-found=true
                                    
                                    # Apply deployment, service, ingress
                                    kubectl apply -f . -n ${NAMESPACE}

                                    # ===== DEBUG: Show what got created =====
                                    echo "=== Deployment created ==="
                                    kubectl describe deployment vbx-deployment -n ${NAMESPACE}
                                    
                                    echo "=== Initial pod status ==="
                                    kubectl get pods -n ${NAMESPACE} -o wide
                                    
                                    # ===== Wait for rollout with diagnostics =====
                                    if kubectl rollout status deployment/vbx-deployment -n ${NAMESPACE} --timeout=10m; then
                                        echo "Rollout successful!"
                                    else
                                        echo "Rollout failed or timed out. Collecting debug info..."
                                        echo "=== Final pod status ==="
                                        kubectl get pods -n ${NAMESPACE} -o wide
                                        
                                        echo "=== Pod events ==="
                                        kubectl describe pods -n ${NAMESPACE}
                                        
                                        echo "=== Deployment events ==="
                                        kubectl describe deployment vbx-deployment -n ${NAMESPACE}
                                        
                                        # Fail the pipeline
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
}
