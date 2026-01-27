pipeline {
    agent any

    environment {
        // Configure these in Jenkins System settings
        SONAR_QUBE_ENV = 'SonarQube' 
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                // For a real project: checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'mkdir -p build && echo "Demo App v1.0" > build/app.txt'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner' 
                    withSonarQubeEnv(SONAR_QUBE_ENV) {
                        sh "${scannerHome}/bin/sonar-scanner " +
                           "-Dsonar.projectKey=devops-demo " +
                           "-Dsonar.projectName=DevOps-Demo " +
                           "-Dsonar.sources=."
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') { 
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to staging environment...'
                echo "Build ${env.BUILD_NUMBER} - Quality Gate Passed!"
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above.'
        }
    }
}
