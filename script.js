// Intersection Observer for Fade-in Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// Smooth Scrolling for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Interactive Call Flow Logic
function showStep(stepNumber) {
    // Remove active class from all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });

    // Add active class to clicked step
    // Note: stepNumber is 1-based index, querySelectorAll is 0-based
    const steps = document.querySelectorAll('.step');
    if (steps[stepNumber - 1]) {
        steps[stepNumber - 1].classList.add('active');
    }

    // Optional: Highlight relevant part of the diagram (if we had specific coordinates or SVG)
    // For now, we just highlight the text step.
    console.log(`Showing step ${stepNumber}`);
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(15, 23, 42, 0.95)';
        nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        nav.style.background = 'rgba(15, 23, 42, 0.7)';
        nav.style.boxShadow = 'none';
    }
});

/* --- Live Demo Simulation --- */
const startCallBtn = document.getElementById('start-call-btn');
const resetCallBtn = document.getElementById('reset-call-btn');
const sipConsole = document.getElementById('sip-console');
const callStatus = document.getElementById('call-status');
const demoPacket = document.getElementById('demo-packet');
const callerEndpoint = document.getElementById('caller-endpoint');
const calleeEndpoint = document.getElementById('callee-endpoint');
const serverNode = document.querySelector('.server-node');

let isCallActive = false;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function logMessage(msg, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.textContent = `[${time}] ${msg}`;
    sipConsole.appendChild(entry);
    sipConsole.scrollTop = sipConsole.scrollHeight;
}

function animatePacket(from, to, duration = 1000) {
    // Simple animation logic - in a real app we'd calculate positions dynamically
    // Here we just toggle classes or use simple CSS transitions for the demo

    // Reset packet
    demoPacket.style.transition = 'none';
    demoPacket.style.opacity = '1';

    if (from === 'caller' && to === 'server') {
        demoPacket.style.left = '10%';
        setTimeout(() => {
            demoPacket.style.transition = `left ${duration}ms linear`;
            demoPacket.style.left = '50%';
        }, 50);
    } else if (from === 'server' && to === 'callee') {
        demoPacket.style.left = '50%';
        setTimeout(() => {
            demoPacket.style.transition = `left ${duration}ms linear`;
            demoPacket.style.left = '90%';
        }, 50);
    } else if (from === 'callee' && to === 'server') {
        demoPacket.style.left = '90%';
        setTimeout(() => {
            demoPacket.style.transition = `left ${duration}ms linear`;
            demoPacket.style.left = '50%';
        }, 50);
    } else if (from === 'server' && to === 'caller') {
        demoPacket.style.left = '50%';
        setTimeout(() => {
            demoPacket.style.transition = `left ${duration}ms linear`;
            demoPacket.style.left = '10%';
        }, 50);
    }

    return delay(duration);
}

async function runCallSimulation() {
    if (isCallActive) return;
    isCallActive = true;
    startCallBtn.disabled = true;
    sipConsole.innerHTML = '<div class="log-entry system">> Starting call simulation...</div>';

    // Step 1: INVITE (Caller -> Server)
    callStatus.textContent = "Status: Initiating Call...";
    callerEndpoint.classList.add('active');
    logMessage("INVITE sip:callee@domain.com SIP/2.0", "sent");
    await animatePacket('caller', 'server');

    // Step 2: 100 Trying (Server -> Caller)
    serverNode.classList.add('active');
    logMessage("SIP/2.0 100 Trying", "received");
    await animatePacket('server', 'caller');

    // Step 3: INVITE (Server -> Callee)
    logMessage("Forwarding INVITE to Callee...", "system");
    await animatePacket('server', 'callee');

    // Step 4: 180 Ringing (Callee -> Server -> Caller)
    calleeEndpoint.classList.add('active');
    callStatus.textContent = "Status: Ringing...";
    logMessage("SIP/2.0 180 Ringing", "received");
    await animatePacket('callee', 'server');
    await animatePacket('server', 'caller');

    // Step 5: 200 OK (Callee -> Server -> Caller)
    await delay(1000); // Simulate ringing time
    callStatus.textContent = "Status: Call Answered";
    logMessage("SIP/2.0 200 OK (Call Answered)", "received");
    await animatePacket('callee', 'server');
    await animatePacket('server', 'caller');

    // Step 6: ACK (Caller -> Callee)
    logMessage("ACK sip:callee@domain.com SIP/2.0", "sent");
    await animatePacket('caller', 'server');
    await animatePacket('server', 'callee');

    // RTP Stream
    callStatus.textContent = "Status: Connected (RTP Audio Flowing)";
    callStatus.style.color = "#10b981";
    logMessage(">> MEDIA STREAM ESTABLISHED (RTP) <<", "system");

    // Simulate active call for a few seconds
    await delay(3000);

    // Step 7: BYE (Caller hangs up)
    callStatus.textContent = "Status: Terminating...";
    callStatus.style.color = "#f59e0b";
    logMessage("BYE sip:callee@domain.com SIP/2.0", "sent");
    await animatePacket('caller', 'server');
    await animatePacket('server', 'callee');

    // Step 8: 200 OK (Callee confirms hangup)
    logMessage("SIP/2.0 200 OK", "received");
    await animatePacket('callee', 'server');
    await animatePacket('server', 'caller');

    callStatus.textContent = "Status: Call Ended";
    callStatus.style.color = "#ef4444";
    logMessage(">> Call Terminated", "system");

    isCallActive = false;
    startCallBtn.disabled = false;
    callerEndpoint.classList.remove('active');
    serverNode.classList.remove('active');
    calleeEndpoint.classList.remove('active');
    demoPacket.style.opacity = '0';
}

startCallBtn.addEventListener('click', runCallSimulation);

resetCallBtn.addEventListener('click', () => {
    isCallActive = false;
    startCallBtn.disabled = false;
    sipConsole.innerHTML = '<div class="log-entry system">> Ready to initiate call...</div>';
    callStatus.textContent = "Status: Idle";
    callStatus.style.color = "var(--secondary)";
    callerEndpoint.classList.remove('active');
    serverNode.classList.remove('active');
    calleeEndpoint.classList.remove('active');
    demoPacket.style.opacity = '0';
});
