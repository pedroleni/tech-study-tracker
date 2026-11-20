// CI en Jenkins: el mismo trabajo que .github/workflows/ci.yml y security-scan.yml.
pipeline {
    agent {
        docker {
            // La de desarrollo. Con Node 22.23 fallan los tests de Form/action de
            // React Router: su Request no acepta el URLSearchParams de jsdom.
            image 'node:22.12.0-bookworm'
        }
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        // Valores ficticios: el cliente de Supabase exige las dos variables al
        // importarse, pero los tests no llaman a ningún servidor real. Las claves
        // de verdad nunca se ponen en el CI.
        VITE_SUPABASE_URL = 'http://127.0.0.1:54321'
        VITE_SUPABASE_ANON_KEY = 'clave-ficticia-de-ci'
        CI = 'true'
    }

    stages {
        // Va primero, con el árbol recién clonado (como el job aparte de GitHub).
        // Si falla, el build queda en FAILURE pero las demás etapas se ejecutan.
        stage('Seguridad') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh '''#!/usr/bin/env bash
                        # Como en GitHub: lo que decide es el contenido del log
                        # ([CRITICAL]/[HIGH]), no el código de salida de cada escáner.
                        set -uo pipefail
                        # Los logs se guardan fuera del árbol para que ningún escáner los lea.
                        logs="${WORKSPACE_TMP}/security-scan"
                        rm -rf "$logs" informes-seguridad
                        mkdir -p "$logs"
                        FAIL=0
                        for script in scan_secrets scan_code_patterns scan_prompt_injection scan_configs; do
                            echo "== $script"
                            bash "scripts/security/${script}.sh" . | tee "$logs/${script}.log" || true
                            if grep -qE '\\[(CRITICAL|HIGH)\\]' "$logs/${script}.log"; then
                                FAIL=1
                            fi
                        done

                        if [ -f package.json ]; then
                            echo "== scan_dependencies"
                            bash scripts/security/scan_dependencies.sh . | tee "$logs/scan_dependencies.log" || true
                            if grep -qE '\\[(CRITICAL|HIGH)\\]' "$logs/scan_dependencies.log"; then
                                FAIL=1
                            fi
                        fi

                        cp -r "$logs" informes-seguridad
                        if [ "$FAIL" -eq 1 ]; then
                            echo "Security scan found CRITICAL/HIGH issues — see the logs above."
                            exit 1
                        fi
                        echo "No CRITICAL/HIGH findings."
                    '''
                }
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        // El motor de Postgres en WebAssembly de los tests de postgres-en-vivo no
        // cabe en los 5 s por defecto en máquinas lentas.
        stage('Tests') {
            steps {
                sh 'npm test -- --testTimeout=30000'
            }
        }

        // Puerta automática de clean code (docs/clean-code.md), la misma que en GitHub.
        stage('Clean code') {
            steps {
                sh 'npm run clean-code'
            }
        }

        // `npm run build` ya comprueba los tipos (`tsc -b`) antes de `vite build`.
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'informes-seguridad/*.log', allowEmptyArchive: true
            echo "Resultado: ${currentBuild.currentResult}"
        }
        cleanup {
            deleteDir()
        }
    }
}
