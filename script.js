document.addEventListener("DOMContentLoaded", function () {

    /* ================= TOP BAR ================= */
    window.closeBar = function () {
        const topBar = document.getElementById("topBar");
        if (topBar) {
            topBar.style.display = "none";
            document.body.classList.add("top-bar-hidden");
        }
    };

    window.toggleMobileNav = function () {
        const overlay = document.getElementById('mobileNavOverlay');
        if (overlay) overlay.classList.toggle('open');
    };

    /* ================= HERO SLIDER ================= */
    let heroIndex = 0;
    const heroSlides = document.querySelectorAll(".slide");
    const heroDots = document.querySelectorAll(".hero .dot");

    function showHeroSlide(n) {
        if (heroSlides.length === 0) return;

        heroSlides.forEach(s => s.classList.remove("active"));
        if (heroDots.length > 0) heroDots.forEach(d => d.classList.remove("active"));

        heroIndex = (n + heroSlides.length) % heroSlides.length;
        heroSlides[heroIndex].classList.add("active");
        if (heroDots.length > 0 && heroDots[heroIndex]) heroDots[heroIndex].classList.add("active");
    }

    window.nextSlide = function () { showHeroSlide(heroIndex + 1); };
    window.prevSlide = function () { showHeroSlide(heroIndex - 1); };
    window.goToSlide = function (i) { showHeroSlide(i); };

    if (heroSlides.length > 0) {
        setInterval(nextSlide, 5000);
    }

    /* ================= CAROUSEL ================= */
    const track = document.getElementById('track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsEl = document.getElementById('dots');

    if (track && prevBtn && nextBtn && dotsEl) {
        const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
        const slideCount = originalSlides.length;
        const visibleCount = window.innerWidth < 600 ? 1 : 3;

        // Infinite Loop pre-calculation
        // Clear track and re-add for clean cloning
        track.innerHTML = '';

        // We need clones at both ends
        const clonesAtEnd = [...originalSlides].map(s => s.cloneNode(true));
        const clonesAtStart = [...originalSlides].map(s => s.cloneNode(true));

        [...clonesAtStart, ...originalSlides, ...clonesAtEnd].forEach(slide => {
            track.appendChild(slide);
        });

        const allSlides = track.querySelectorAll('.carousel-slide');
        let current = slideCount; // Start at first original slide
        let isTransitioning = false;

        function updateCarousel(instant = false) {
            track.style.transition = instant ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            const slideWidthPercent = 100 / visibleCount;

            // Apply widths to ALL slides to match visibleCount
            allSlides.forEach(s => {
                s.style.flex = `0 0 ${slideWidthPercent}%`;
                s.style.width = `${slideWidthPercent}%`;
                s.style.boxSizing = 'border-box';
            });

            track.style.transform = `translateX(-${current * slideWidthPercent}%)`;

            // Dots update
            const dots = dotsEl.querySelectorAll('.carousel-dot');
            if (dots.length > 0) {
                let logicalIndex = (current - slideCount) % slideCount;
                if (logicalIndex < 0) logicalIndex += slideCount;
                const dotIndex = Math.min(Math.floor((logicalIndex / (slideCount - 1)) * (dots.length - 1)), dots.length - 1);
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === dotIndex);
                });
            }
        }

        // Initial setup
        updateCarousel(true);

        function handleJump() {
            isTransitioning = false;
            if (current >= slideCount * 2) {
                current = slideCount;
                updateCarousel(true);
            } else if (current <= 0) {
                current = slideCount;
                updateCarousel(true);
            }
        }

        track.addEventListener('transitionend', handleJump);

        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            current--;
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            current++;
            updateCarousel();
        });

        /* --- Drag Support --- */
        let isDragging = false;
        let startX, startScrollLeft;
        let dragStartTime;

        const dragStart = (e) => {
            if (isTransitioning) return;
            isDragging = true;
            dragStartTime = Date.now();
            track.style.transition = 'none';
            track.classList.add('dragging');
            startX = (e.pageX || e.touches[0].pageX);
            startScrollLeft = current;
        };

        const dragMove = (e) => {
            if (!isDragging) return;
            const x = (e.pageX || e.touches[0].pageX);
            const walk = (x - startX);
            const slideWidthPx = allSlides[0].offsetWidth;
            const walkPercent = (walk / slideWidthPx);

            current = startScrollLeft - walkPercent;
            const slideWidthPercent = 100 / visibleCount;
            track.style.transform = `translateX(-${current * slideWidthPercent}%)`;
        };

        const dragEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('dragging');

            current = Math.round(current);
            isTransitioning = true;
            updateCarousel();
        };

        track.addEventListener('mousedown', dragStart);
        track.addEventListener('touchstart', dragStart);
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('touchmove', dragMove, { passive: false });
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);
        window.addEventListener('mouseleave', dragEnd);

        window.addEventListener('resize', () => {
            const newCount = window.innerWidth <= 768 ? 1 : 3;
            if (newCount !== visibleCount) location.reload();
        });
    }

    /* ================= VIDEO MODAL ================= */
    const playBtn = document.querySelector(".play-button");
    const videoModal = document.getElementById("videoModal");
    const closeVideo = document.getElementById("closeVideo");
    const youtubeVideo = document.getElementById("youtubeVideo");
    const videoSrc = "https://www.youtube.com/embed/LP0qVgTXjXg?autoplay=1&mute=1&playsinline=1"; // Example video

    if (playBtn && videoModal && closeVideo && youtubeVideo) {
        playBtn.addEventListener("click", () => {
            youtubeVideo.src = videoSrc;
            videoModal.style.display = "block";
            document.body.style.overflow = "hidden"; // Prevent scrolling
        });

        const closeModalFunc = () => {
            videoModal.style.display = "none";
            youtubeVideo.src = ""; // Stop video
            document.body.style.overflow = "auto";
        };

        closeVideo.addEventListener("click", closeModalFunc);

        window.addEventListener("click", (event) => {
            if (event.target === videoModal) {
                closeModalFunc();
            }
        });
    }

});