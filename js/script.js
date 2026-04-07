// js/script.js
// Three.js 3D Background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 2000;
    posArray[i+1] = (Math.random() - 0.5) * 1000;
    posArray[i+2] = (Math.random() - 0.5) * 1000;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.7,
    color: 0x6c5ce7,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

camera.position.z = 500;

// Animation
function animateParticles() {
    requestAnimationFrame(animateParticles);
    particlesMesh.rotation.x += 0.0005;
    particlesMesh.rotation.y += 0.0005;
    renderer.render(scene, camera);
}

animateParticles();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Counter Animation
const counters = document.querySelectorAll('.stat-number');
const speed = 200;

counters.forEach(counter => {
    const updateCount = () => {
        const target = parseInt(counter.getAttribute('data-target'));
        const count = parseInt(counter.innerText);
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(updateCount, 20);
        } else {
            counter.innerText = target;
        }
    }
    
    updateCount();
});

// Tilt Effect for Feature Cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navigation Active State
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Dashboard Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
    });
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const darkModeToggle = document.getElementById('darkModeToggle');

function setTheme(isDark) {
    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (darkModeToggle) darkModeToggle.checked = true;
    } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (darkModeToggle) darkModeToggle.checked = false;
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
    });
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
        setTheme(e.target.checked);
    });
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    setTheme(true);
}

// Website Generation Logic
const API_BASE_URL = '/api'; // Replace with your backend API URL

class WebsiteGenerator {
    constructor() {
        this.currentSiteId = null;
        this.init();
    }
    
    init() {
        const generateBtn = document.getElementById('generateBtn');
        const promptInput = document.getElementById('promptInput');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateWebsite());
        }
        
        // Template usage
        document.querySelectorAll('.use-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.template-card');
                const prompt = card.getAttribute('data-prompt');
                if (promptInput) promptInput.value = prompt;
                switchTab('creator');
            });
        });
        
        // Start now button
        const startNowBtn = document.getElementById('startNowBtn');
        if (startNowBtn) {
            startNowBtn.addEventListener('click', () => {
                document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }
    
    async generateWebsite() {
        const prompt = document.getElementById('promptInput').value.trim();
        
        if (!prompt) {
            this.showNotification('الرجاء كتابة وصف للموقع', 'error');
            return;
        }
        
        // Show generation status
        this.showGenerationStatus();
        
        try {
            // Step 1: Create temporary email
            this.updateStatus('جاري إنشاء بريد مؤقت...', 10);
            const email = await this.createTempEmail();
            
            // Step 2: Get CSRF token
            this.updateStatus('جاري تجهيز الجلسة الآمنة...', 25);
            const csrfToken = await this.getCsrfToken();
            
            // Step 3: Sign in with email
            this.updateStatus('جاري المصادقة...', 35);
            await this.signIn(email, csrfToken);
            
            // Step 4: Get magic link from email
            this.updateStatus('جاري التحقق من البريد...', 50);
            const magicLink = await this.getMagicLink(email);
            
            // Step 5: Authenticate with magic link
            this.updateStatus('جاري فتح الجلسة...', 65);
            await this.authenticate(magicLink);
            
            // Step 6: Create AI conversation
            this.updateStatus('جاري تهيئة الذكاء الاصطناعي...', 75);
            const conversationId = await this.createConversation();
            
            // Step 7: Generate website
            this.updateStatus('🤖 الذكاء الاصطناعي يكتب موقعك...', 85);
            const siteData = await this.generateWithAI(conversationId, prompt);
            
            // Step 8: Get source code
            this.updateStatus('جاري تجهيز الملفات...', 95);
            const sourceCode = await this.getSourceCode(siteData.slug);
            
            // Step 9: Show result
            this.updateStatus('تم الإنشاء بنجاح!', 100);
            this.showResult(siteData.slug, sourceCode);
            
            // Save to history
            this.saveToHistory({
                id: siteData.slug,
                prompt: prompt,
                date: new Date().toISOString(),
                url: `https://htmlpub.com/${siteData.slug}`
            });
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showNotification('حدث خطأ أثناء إنشاء الموقع. يرجى المحاولة مرة أخرى.', 'error');
            this.hideGenerationStatus();
        }
    }
    
    async createTempEmail() {
        const response = await fetch('https://api.internal.temp-mail.io/api/v3/email/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ min_name_length: 10, max_name_length: 10 })
        });
        const data = await response.json();
        return data.email;
    }
    
    async getCsrfToken() {
        try {
            const response = await fetch('https://htmlpub.com/api/auth/csrf');
            const data = await response.json();
            return data.csrfToken;
        } catch {
            return "0ce3ae7fbc30f663e116f935f2d7dafc94177c70dcc4f7def2089816f69bcabb";
        }
    }
    
    async signIn(email, csrfToken) {
        const response = await fetch('https://htmlpub.com/api/auth/signin/nodemailer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            },
            body: new URLSearchParams({
                email: email,
                csrfToken: csrfToken,
                callbackUrl: '/edit',
                json: 'true'
            })
        });
        return response.json();
    }
    
    async getMagicLink(email) {
        for (let i = 0; i < 15; i++) {
            await this.sleep(3000);
            const response = await fetch(`https://api.internal.temp-mail.io/api/v3/email/${email}/messages`);
            const messages = await response.json();
            
            if (messages && messages.length > 0) {
                const body = messages[0].body_text + messages[0].body_html;
                const match = body.match(/https:\/\/htmlpub\.com\/api\/auth\/callback\/[^\s"']+/);
                if (match) return match[0];
            }
        }
        throw new Error('Magic link not found');
    }
    
    async authenticate(magicLink) {
        const response = await fetch(magicLink);
        return response;
    }
    
    async createConversation() {
        const response = await fetch('https://htmlpub.com/api/ai/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        return data.id;
    }
    
    async generateWithAI(conversationId, prompt) {
        const response = await fetch(`https://htmlpub.com/api/ai/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: prompt,
                deviceInfo: {
                    type: 'desktop',
                    screenWidth: 1920,
                    screenHeight: 1080,
                    touch: false
                }
            })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.includes('create_page')) {
                    const jsonStr = line.replace('data: ', '');
                    const data = JSON.parse(jsonStr);
                    if (data.type === 'tool_result') {
                        const result = JSON.parse(data.result);
                        if (result.slug) return result;
                    }
                }
            }
        }
        
        throw new Error('No page created');
    }
    
    async getSourceCode(slug) {
        const response = await fetch(`https://htmlpub.com/api/pages/${slug}/source`);
        const data = await response.json();
        return data.html;
    }
    
    showGenerationStatus() {
        document.getElementById('generationStatus').style.display = 'block';
        document.getElementById('resultSection').style.display = 'none';
    }
    
    updateStatus(message, progress) {
        document.getElementById('statusMessage').innerText = message;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
    
    hideGenerationStatus() {
        document.getElementById('generationStatus').style.display = 'none';
    }
    
    showResult(slug, sourceCode) {
        this.hideGenerationStatus();
        document.getElementById('resultSection').style.display = 'block';
        
        const siteUrl = `https://htmlpub.com/${slug}`;
        document.getElementById('siteLink').href = siteUrl;
        document.getElementById('siteLink').innerText = siteUrl;
        
        // Download button
        document.getElementById('downloadBtn').onclick = () => {
            const blob = new Blob([sourceCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `website_${slug}.html`;
            a.click();
            URL.revokeObjectURL(url);
        };
        
        // Preview button
        document.getElementById('previewBtn').onclick = () => {
            window.open(siteUrl, '_blank');
        };
        
        // Share button
        document.getElementById('shareBtn').onclick = () => {
            if (navigator.share) {
                navigator.share({
                    title: 'AI Website',
                    url: siteUrl
                });
            } else {
                navigator.clipboard.writeText(siteUrl);
                this.showNotification('تم نسخ الرابط إلى الحافظة!', 'success');
            }
        };
        
        this.currentSiteId = slug;
    }
    
    saveToHistory(site) {
        let history = JSON.parse(localStorage.getItem('website_history') || '[]');
        history.unshift(site);
        history = history.slice(0, 10);
        localStorage.setItem('website_history', JSON.stringify(history));
        this.updateHistoryList();
    }
    
    updateHistoryList() {
        const historyList = document.getElementById('historyList');
        const history = JSON.parse(localStorage.getItem('website_history') || '[]');
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>لم تقم بإنشاء أي مواقع بعد</p>
                    <button class="btn-primary" onclick="switchTab('creator')">ابدأ الآن</button>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = history.map(site => `
            <div class="history-item">
                <div class="history-info">
                    <h4>${site.prompt.substring(0, 50)}...</h4>
                    <p>${new Date(site.date).toLocaleString('ar')}</p>
                    <a href="${site.url}" target="_blank">${site.url}</a>
                </div>
                <div class="history-actions">
                    <button onclick="window.open('${site.url}', '_blank')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00ff88' : '#ff4757'};
            color: ${type === 'success' ? '#1a1a2e' : 'white'};
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app
const generator = new WebsiteGenerator();

// Add history styles
const style = document.createElement('style');
style.textContent = `
    .history-item {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .history-info h4 {
        color: white;
        margin-bottom: 5px;
    }
    
    .history-info p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        margin-bottom: 5px;
    }
    
    .history-info a {
        color: var(--accent);
        text-decoration: none;
        font-size: 12px;
    }
    
    .history-actions button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        padding: 8px 12px;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .history-actions button:hover {
        background: var(--accent);
    }
`;
document.head.appendChild(style);

// Load history on page load
generator.updateHistoryList();
