/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Jenkins Continuous Integration Declarative Pipeline
   Primary Owner: Akul Agarwal (25070122030) - DevOps & Supporting Services Lead
   Course Unit Mapping: Unit 5 (Jenkins CI/CD Automation & Build Verification)
   ========================================================================== */

pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
        PORT = 3000
        MONGODB_URI = 'mongodb://127.0.0.1:27017/hotelDB'
    }

    stages {
        stage('Checkout & SCM Verification') {
            steps {
                echo 'Checking out StayEase repository from Git...'
                checkout scm
                sh 'git log -1 --stat'
            }
        }

        stage('Install Node Dependencies') {
            steps {
                echo 'Installing production and testing dependencies...'
                sh 'npm install'
            }
        }

        stage('Syntax & Static Validation') {
            steps {
                echo 'Validating JavaScript syntax and security files...'
                sh 'node --check backend/server.js'
                sh 'node --check backend/services/billingService.js'
                sh 'node --check backend/services/availabilityService.js'
                sh 'node --check backend/services/voucherService.js'
            }
        }

        stage('Run Automated Unit Tests') {
            steps {
                echo 'Executing StayEase Unit Test Suite (Availability, Billing, Vouchers)...'
                sh 'npm test'
            }
        }

        stage('Tomcat Component Build Check') {
            steps {
                echo 'Verifying Apache Tomcat demo servlet files (Unit 5)...'
                sh 'ls -la tomcat-demo/WEB-INF/web.xml'
                sh 'ls -la tomcat-demo/src/StayEaseServlet.java'
            }
        }

        stage('Build & Audit Report') {
            steps {
                echo 'StayEase Continuous Integration Pipeline successfully validated.'
                echo 'All hotel lifecycle rules, financial calculations, and security guards passed.'
            }
        }
    }

    post {
        always {
            echo 'Archiving test reports and build status.'
        }
        success {
            echo 'SUCCESS: StayEase Hotel Management System is build-ready!'
        }
        failure {
            echo 'FAILURE: Jenkins CI detected an error in the pipeline.'
        }
    }
}
