document.addEventListener('DOMContentLoaded', () => {
    // 💡 1文字ずつバラバラに分解する共通の魔法の関数（命令）を作ります
    function splitTextToSpan(elementId) {
        const target = document.getElementById(elementId);
        if (!target) return;
        
        const textContent = target.textContent;
        const textArray = textContent.split('');
        let htmlBuffer = '';

        textArray.forEach((char, index) => {
            if (char === ' ') {
                htmlBuffer += ' '; // 空白はそのまま
            } else {
                // 1文字ごとに番号（--delay）を仕込む
                htmlBuffer += `<span style="--delay: ${index * 0.06}s">${char}</span>`;
            }
        });
        target.innerHTML = htmlBuffer;
    }

    // 🌸 タイトル（WELCOME!）とサブタイトル（Kuten Portfolio）をそれぞれ分解実行！
    splitTextToSpan('animate-title');
    splitTextToSpan('animate-subtitle');
    
    const loadingScreen = document.getElementById('loading-screen');
    const cover = document.getElementById('welcome-cover');
    const mainContent = document.getElementById('main-content');
    
    const hasVisited = sessionStorage.getItem('hasVisitedFv');

    // 🌟【下層ページの処理】ウェルカムカバーがないページの場合
    if (!cover) {
        return; 
    }

    // ==========================================================================
    // 🏠【トップページ（index.html）用の処理】
    // ==========================================================================
    if (hasVisited) {
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (cover) cover.style.display = 'none';
        
        document.body.classList.remove('loading-active', 'fv-active');
        if (mainContent) mainContent.classList.add('is-visible');
        
    } else {
        document.body.classList.add('loading-active');

        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
            }
            document.body.classList.remove('loading-active');
            document.body.classList.add('fv-active');
        }, 3000);

function moveToHome() {
    if (document.body.classList.contains('fv-active')) {

        cover.classList.add('is-scrolled');
        mainContent.classList.add('is-visible');

        sessionStorage.setItem('hasVisitedFv', 'true');

        setTimeout(() => {

            document.body.classList.remove('fv-active');

            window.scrollTo(0, 0);

            if (cover) {
                cover.style.display = 'none';
            }

        }, 1200);

    }
}
        

        window.addEventListener('wheel', (e) => {
            if (document.body.classList.contains('fv-active') && e.deltaY > 0) {
                e.preventDefault();
                moveToHome();
            }
        }, { passive: false });

        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!document.body.classList.contains('fv-active')) return;

            let touchEndY = e.touches[0].clientY;
            let deltaY = touchStartY - touchEndY;

            if (deltaY > 10) {
                moveToHome();
            }
        }, { passive: true });
    }
});
// ==========================================================================
// 🖼️ 作品詳細（モーダルポップアップ）の制御（拡大＆ドラッグ移動付き！）
// ==========================================================================
const modal = document.getElementById('work-modal');

if (modal) {
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalTools = document.getElementById('modal-tools');
    const modalTime = document.getElementById('modal-time');
    const modalConcept = document.getElementById('modal-concept');
    const modalReference = document.getElementById('modal-reference');
    
    const specTable = modal.querySelector('.modal-spec-table');
    const conceptBox = modal.querySelector('.modal-concept-box');
    
    const closeBtn = modal.querySelector('.modal-close-btn');
    const backdrop = modal.querySelector('.modal-backdrop');
    const workItems = document.querySelectorAll('.work-item');

    const imgContainer = modal.querySelector('.modal-left-img');
    let isZoomed = false;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    workItems.forEach(workItem => {
        workItem.addEventListener('click', () => {
            const img = workItem.getAttribute('data-img');
            const title = workItem.getAttribute('data-title');
            const tools = workItem.getAttribute('data-tools');
            const time = workItem.getAttribute('data-time');
            const concept = workItem.getAttribute('data-concept');
            const url = workItem.getAttribute('data-url');

            if (modalImg && img) modalImg.src = img;
            if (modalTitle && title) modalTitle.textContent = title;
            if (modalTime && time) modalTime.textContent = time;
            
            if (tools) {
                if (modalTools) modalTools.textContent = tools;
                if (specTable) specTable.style.display = '';
            } else {
                if (specTable) specTable.style.display = 'none';
            }

            if (concept) {
                if (modalConcept) modalConcept.textContent = concept;

                if (modalReference) {
                    if (url) {
                        modalReference.innerHTML =
                            `<a href="${url}" target="_blank" rel="noopener noreferrer">
                                参考サイトを見る
                            </a>`;
                    } else {
                        modalReference.innerHTML = '';
                    }
                }

    if (conceptBox) conceptBox.style.display = '';
} else {
    if (conceptBox) conceptBox.style.display = 'none';
}
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    });

    if (imgContainer && modalImg) {
        imgContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;

            isZoomed = !isZoomed;
            if (isZoomed) {
                imgContainer.classList.add('is-zoomed');
                modalImg.style.transform = `scale(2) translate(0px, 0px)`; // 2倍に拡大
                translateX = 0;
                translateY = 0;
            } else {
                resetZoom();
            }
        });

        const startDrag = (e) => {
            if (!isZoomed) return;
            isDragging = true;
            imgContainer.style.cursor = 'grabbing';
            const pageX = e.pageX || e.touches[0].pageX;
            const pageY = e.pageY || e.touches[0].pageY;
            startX = pageX - translateX;
            startY = pageY - translateY;
        };

        const moveDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const pageX = e.pageX || (e.touches && e.touches[0].pageX);
            const pageY = e.pageY || (e.touches && e.touches[0].pageY);
            translateX = pageX - startX;
            translateY = pageY - startY;

            translateX = Math.max(Math.min(translateX, 150), -150);
            translateY = Math.max(Math.min(translateY, 150), -150);

            modalImg.style.transform = `scale(2) translate(${translateX / 2}px, ${translateY / 2}px)`;
        };

        const stopDrag = () => {
            isDragging = false;
            if (imgContainer) {
                imgContainer.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
            }
        };

        imgContainer.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('mouseup', stopDrag);

        imgContainer.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('touchend', stopDrag);
    }

    function resetZoom() {
        isZoomed = false;
        isDragging = false;
        translateX = 0;
        translateY = 0;
        if (imgContainer) imgContainer.classList.remove('is-zoomed');
        if (modalImg) modalImg.style.transform = 'scale(1) translate(0px, 0px)';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        resetZoom(); 
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
}
// ==========================================================================
    // 🚀 ページトップに戻るボタンの制御
    // ==========================================================================
    const pageTopBtn = document.getElementById('page-top-btn');

    if (pageTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                pageTopBtn.classList.add('is-visible');
            } else {
                pageTopBtn.classList.remove('is-visible');
            }
        });

        pageTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
}
// ==========================================================================
// 🌸 プロフィールと各スキルがスクロールされたら個別にふわっと出す処理
// ==========================================================================
const profileAnimateBox = document.querySelector('.profile-scroll-animate');

if (profileAnimateBox) {
    const observerOptions = { root: null, threshold: 0.1 };
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                profileAnimateBox.classList.add('is-visible');
            }
        });
    }, observerOptions);
    scrollObserver.observe(profileAnimateBox);
}

const skillContainers = document.querySelectorAll('.skill-container');
const welcomeThanks = document.querySelector('.welcome-thanks');
if (skillContainers.length > 0) {
    const skillObserverOptions = {
        root: null,
        threshold: 0.2
    };

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                skillObserver.unobserve(entry.target);
            }
        });
    }, skillObserverOptions);

    skillContainers.forEach(container => {
        skillObserver.observe(container);
    });
    
}