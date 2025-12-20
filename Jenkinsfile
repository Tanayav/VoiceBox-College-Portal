pipeline {
    agent {
        kubernetes {
            inheritFrom 'default'
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
        memory: "64Mi"
        cpu: "10m"
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
    - --insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085
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
        memory: "64Mi"
        cpu: "10m"
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
        cpu: "10m"
      limits:
        memory: "128Mi"
        cpu: "100m"
'''
        }
    }
    
    environment {
        // Internal K8s Service Address from reference
        registry = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/vbx-app" 
        // Note: Using student credentials as provided
        registryCredential = "nexus-credentials"
        kubeconfigId = "k8s-kubeconfig"
        NAMESPACE = 'jenkins' // Assuming deployment is in jenkins namespace or similar
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
                       sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} ${registry.split('/')[0]}"
                   }
               }
           }
       }

       stage('Build Docker Image') {
           steps {
               container('dind') {
                   // Build explicitly tagging latest
                   sh "docker build -t ${registry}:${env.BUILD_ID} ."
                   sh "docker tag ${registry}:${env.BUILD_ID} ${registry}:latest"
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
                   sh "docker push ${registry}:${env.BUILD_ID}"
                   sh "docker push ${registry}:latest"
               }
           }
       }

       stage('Deploy Application') {
           steps {
               container('kubectl') {
                   withCredentials([file(credentialsId: kubeconfigId, variable: 'KUBECONFIG')]) {
                       script {
                            sh """
                               # Update image in deployment yaml files if needed, or set image directly
                               
                               # Apply manifests
                               kubectl apply -f k8s/
                               
                               # Force update image
                               kubectl set image deployment/vbx-deployment vbx-container=${registry}:${env.BUILD_ID} --record
                               
                               # Wait for rollout
                               if kubectl rollout status deployment/vbx-deployment --timeout=5m; then
                                   echo "Rollout successful!"
                               else
                                   echo "Rollout failed. Debugging..."
                                   kubectl get pods
                                   kubectl describe deployment vbx-deployment
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
