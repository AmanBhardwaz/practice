/* script.js - Interactive Dynamic Enhancements */

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initTheme();
  initCustomCursor();
  initParticles();
  initTypingEffect();
  initActiveNavHighlight();
  initStatsCounter();
  initProjectFilters();
  initTiltEffect();
  initContactForm();
  initMobileMenu();
});

/* ==========================================================================
   1. Preloader Closer
   ========================================================================== */
function initPreloader() {
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
      }, 800);
    });
  }
}

/* ==========================================================================
   2. Theme Manager (Light / Dark)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.querySelector(".theme-toggle");
  if (!themeToggleBtn) return;

  // Check saved theme or default to system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  let currentTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
    
    // Quick canvas adjustment on theme change if colors depend on theme
    if (window.particleCanvasResize) {
      window.particleCanvasResize();
    }
  });
}

/* ==========================================================================
   3. Custom Magnetic Cursor
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector(".custom-cursor-dot");
  const ring = document.querySelector(".custom-cursor-ring");

  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0; // Actual mouse position
  let ringX = 0, ringY = 0;   // Interpolated ring position
  let dotX = 0, dotY = 0;     // Interpolated dot position

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor follow with Linear Interpolation (lerp)
  function renderCursor() {
    // Target interpolation parameters
    const ringSpeed = 0.15;
    const dotSpeed = 0.8;

    ringX += (mouseX - ringX) * ringSpeed;
    ringY += (mouseY - ringY) * ringSpeed;
    dotX += (mouseX - dotX) * dotSpeed;
    dotY += (mouseY - dotY) * dotSpeed;

    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Add hover effect states
  const interactables = document.querySelectorAll(
    "a, button, input, textarea, .filter-btn, .timeline-card, .project-card, .social-btn"
  );

  interactables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("cursor-hover");
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });
}

/* ==========================================================================
   4. High-Performance Canvas Interactive Background
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particlesArray = [];
  let mouse = { x: null, y: null, radius: 150 };

  // Track window size and mouse movement
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticleArray();
  }
  window.addEventListener("resize", resizeCanvas);
  window.particleCanvasResize = resizeCanvas; // expose to external trigger

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Blueprint
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      // Bounce off walls
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Move particle
      this.x += this.directionX;
      this.y += this.directionY;

      // Mouse interactive collision / pushing effect
      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 4;
          this.y += Math.sin(angle) * force * 4;
        }
      }

      this.draw();
    }
  }

  function initParticleArray() {
    particlesArray = [];
    // Adjust density depending on resolution
    const numberOfParticles = Math.min((canvas.width * canvas.height) / 9000, 100);
    
    // Choose dynamic color palette based on active theme
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const baseColor = isDark ? "rgba(124, 77, 255," : "rgba(0, 229, 255,";

    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * (canvas.width - size * 2) + size;
      const y = Math.random() * (canvas.height - size * 2) + size;
      const directionX = (Math.random() * 1) - 0.5;
      const directionY = (Math.random() * 1) - 0.5;
      const alpha = Math.random() * 0.3 + 0.1;
      const color = `${baseColor}${alpha})`;

      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Draw lines connecting particles that are close to each other
  function connectParticles() {
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const lineColor = isDark ? "rgba(124, 77, 255," : "rgba(0, 229, 255,";

    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          let opacity = (1 - (distance / 120)) * 0.15;
          ctx.strokeStyle = `${lineColor}${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  animate();
}

/* ==========================================================================
   5. Dynamic Auto-typing Headings Effect
   ========================================================================== */
function initTypingEffect() {
  const typingTextSpan = document.querySelector(".hero-typing .typing-text");
  if (!typingTextSpan) return;

  const roles = [
    "Software Developer",
    "Full Stack Developer",
    "Competitive Programmer",
    "Open Source Contributor"
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typingTextSpan.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typingTextSpan.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 1500; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 1000);
}

/* ==========================================================================
   6. Dynamic Active Navigation Indicator & Header Resize
   ========================================================================== */
function initActiveNavHighlight() {
  const header = document.querySelector("header");
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  // Resize Header on Scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Update active navigation state based on visibility
  const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -60% 0px", // triggers when section dominates middle viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   7. Stat Card Counting Incrementor Animation
   ========================================================================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length === 0) return;

  const countUp = (element) => {
    const target = parseInt(element.getAttribute("data-target"), 10);
    const suffix = element.getAttribute("data-suffix") || "";
    let count = 0;
    const duration = 2000; // ms
    const increment = target / (duration / 16); // ~60fps rendering frame rate

    const updateCount = () => {
      count += increment;
      if (count < target) {
        element.textContent = Math.floor(count) + suffix;
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target + suffix;
      }
    };
    updateCount();
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        // Avoid duplicate triggers
        if (!element.classList.contains("counted")) {
          element.classList.add("counted");
          countUp(element);
        }
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach((num) => observer.observe(num));

  // Visualizer trigger for skills bars in about section too
  const skillBars = document.querySelectorAll(".skill-bar-fill");
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const targetPercent = entry.target.parentElement.previousElementSibling.querySelector(".skill-percentage").textContent;
        entry.target.style.width = targetPercent;
      }
    });
  }, { threshold: 0.1 });
  skillBars.forEach((bar) => skillObserver.observe(bar));
}

/* ==========================================================================
   8. Grid Interactive Category Filtering
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  if (filterBtns.length === 0 || projectCards.length === 0) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Toggle button states
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        
        // Dynamic Fade styling transitions
        if (category === "all" || cardCategory === category) {
          card.style.display = "block";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1) translateY(0)";
          }, 50);
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.85) translateY(20px)";
          setTimeout(() => {
            card.style.display = "none";
          }, 300); // match fade transition
        }
      });
    });
  });
}

/* ==========================================================================
   9. Premium Interactive 3D Card Hover Angle Tilt
   ========================================================================== */
function initTiltEffect() {
  const cards = document.querySelectorAll(".project-card, .service-card, .stat-card");
  
  // Disable 3D tilt effects on touch-based mobile viewports
  if (window.matchMedia("(pointer: coarse)").matches) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside the element
      const y = e.clientY - rect.top;  // y coordinate inside the element

      // Center parameters
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Angular rotation factor
      const maxTilt = 8; // degrees
      const tiltX = ((centerY - y) / centerY) * maxTilt;
      const tiltY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      // Smoothly reset transformations
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

/* ==========================================================================
   10. Glassmorphic Form Real-Time Validation & Alerts
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("portfolio-contact-form");
  if (!form) return;

  const inputs = form.querySelectorAll(".form-input");
  const popup = document.querySelector(".submit-popup");
  const popupText = document.querySelector(".submit-popup-text");

  // Validate elements individually on blur/input
  inputs.forEach((input) => {
    const statusSpan = input.nextElementSibling.nextElementSibling; // .form-status

    const validateInput = () => {
      if (!input.value.trim()) {
        if (statusSpan) {
          statusSpan.textContent = "This field is required";
          statusSpan.className = "form-status error";
        }
        return false;
      }
      
      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          if (statusSpan) {
            statusSpan.textContent = "Please enter a valid email address";
            statusSpan.className = "form-status error";
          }
          return false;
        }
      }

      if (statusSpan) {
        statusSpan.textContent = "";
        statusSpan.className = "form-status success";
      }
      return true;
    };

    input.addEventListener("blur", validateInput);
    input.addEventListener("input", () => {
      if (statusSpan && statusSpan.classList.contains("error")) {
        validateInput(); // clear error once correction begins
      }
    });
  });

  // Submit Handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    inputs.forEach((input) => {
      const statusSpan = input.nextElementSibling.nextElementSibling;
      if (!input.value.trim()) {
        isFormValid = false;
        if (statusSpan) {
          statusSpan.textContent = "This field is required";
          statusSpan.className = "form-status error";
        }
      }
    });

    if (isFormValid) {
      const submitBtn = form.querySelector(".btn-primary");
      const originalText = submitBtn.innerHTML;
      
      // Visual feedback states
      submitBtn.textContent = "Sending Message...";
      submitBtn.disabled = true;

      const formData = new FormData(form);
      
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          // Show premium bottom-right alert popup
          if (popup) {
            popupText.textContent = "Success! Message has been routed.";
            popup.classList.add("active");
            
            setTimeout(() => {
              popup.classList.remove("active");
            }, 4000);
          }
          form.reset();
          
          // Reset floating label inputs
          inputs.forEach((input) => {
            const statusSpan = input.nextElementSibling.nextElementSibling;
            if (statusSpan) statusSpan.textContent = "";
          });
        } else {
          console.log(response);
          if (popup) {
            popupText.textContent = json.message || "Error submitting form.";
            popup.classList.add("active");
            setTimeout(() => popup.classList.remove("active"), 4000);
          }
        }
      })
      .catch((error) => {
        console.log(error);
        if (popup) {
          popupText.textContent = "Something went wrong!";
          popup.classList.add("active");
          setTimeout(() => popup.classList.remove("active"), 4000);
        }
      })
      .then(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    }
  });
}

/* ==========================================================================
   11. Hamburger Navigation Controller
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links a");

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Close nav on anchor click
  links.forEach((link) => {
    link.addEventListener("click", () => {
      toggleBtn.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  // Close nav on click outside active context
  document.addEventListener("click", (e) => {
    if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
      toggleBtn.classList.remove("active");
      navLinks.classList.remove("active");
    }
  });
}
