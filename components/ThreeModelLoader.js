class ThreeModelLoader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .loader-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    z-index: 1000;
                    background-color: rgba(255, 255, 255, 0.9);
                    padding: 20px;
                    border-radius: 8px;
                }

                .progress-bar {
                    width: 200px;
                    height: 4px;
                    background: #1a1a1a;
                    border-radius: 2px;
                    margin: 10px auto;
                }

                .progress-fill {
                    width: 0%;
                    height: 100%;
                    background: #3498db;
                    border-radius: 2px;
                    transition: width 0.2s ease;
                }

                .progress-text {
                    font-family: Arial, sans-serif;
                    color: #000000;
                    font-size: 14px;
                    font-weight: bold;
                }

                .hidden {
                    display: none;
                }
            </style>
            <div class="loader-container">
                <div class="progress-text" style="margin-bottom: 10px;">Loading: <span class="model-name"></span></div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0%</div>
            </div>
        `;

        this.container = this.shadowRoot.querySelector('.loader-container');
        this.progressBar = this.shadowRoot.querySelector('.progress-fill');
        this.progressText = this.shadowRoot.querySelector('.progress-text:last-child');
        this.modelNameElement = this.shadowRoot.querySelector('.model-name');
    }

    updateProgress(progress, modelName = '') {
        const percentage = Math.round(progress * 100);
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}%`;
        
        if (modelName) {
            this.modelNameElement.textContent = modelName;
        }
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }
}

customElements.define('three-model-loader', ThreeModelLoader); 