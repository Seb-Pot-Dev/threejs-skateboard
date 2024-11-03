class ScrollingLoad extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                #loading-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 10px;
                    background-color: #3498db;
                    transition: height 0.25s;
                }
            </style>
            <div id="loading-bar"></div>
        `;
    }

    connectedCallback() {
        const scrollableSelector = this.getAttribute('data-scrollable-selector');
        this.scrollableElement = document.querySelector(scrollableSelector);
        if (this.scrollableElement) {
            this.scrollableElement.addEventListener('scroll', this.updateLoadingBar.bind(this));
        }
    }

    updateLoadingBar() {
        const scrollTop = this.scrollableElement.scrollTop;
        const scrollHeight = this.scrollableElement.scrollHeight - this.scrollableElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        this.shadowRoot.getElementById('loading-bar').style.height = scrollPercentage + '%';
    }
}

customElements.define('scrolling-load', ScrollingLoad);
