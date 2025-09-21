// --- Main Initialization Script ---
document.addEventListener('DOMContentLoaded', async function () {

    // --- email ---
    const user = 'darwinchris.edu0525';
    const domain = 'gmail.com';
    const emailLink = document.getElementById('email-link');
    const emailAddress = `${user}@${domain}`;
    emailLink.href = `mailto:${emailAddress}`;
    emailLink.textContent = emailAddress;

    // --- Copy to Clipboard ---
    const copyBtn = document.getElementById('copy-email-btn');
    const copyFeedback = document.getElementById('copy-feedback');
    copyBtn.addEventListener('click', () => {
        const tempInput = document.createElement('input');
        tempInput.value = emailAddress;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand('copy');
            copyFeedback.classList.remove('opacity-0');
            setTimeout(() => { copyFeedback.classList.add('opacity-0'); }, 2000);
        } catch (err) {
            console.error('Failed to copy email: ', err);
        }
        document.body.removeChild(tempInput);
    });

    // --- Set Current Year in Footer ---
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // --- 3D Project Card Hover Effect ---
    const cardContainers = document.querySelectorAll('.project-card-container');
    cardContainers.forEach(container => {
        const card = container.querySelector('.project-card');
        container.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.1s linear, box-shadow 0.3s ease'; });
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -12; // Increased rotation
            const rotateY = ((x - centerX) / centerX) * 12;  // Increased rotation
            card.style.transform = `translateZ(50px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`; // Increased translateZ
        });
        container.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
            card.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)';
        });
    });

    // --- Scrolling Skills River ---
    const skills = [
        'C#', '.NET', 'Python', 'C++', 'PyTorch', 'Java', 'C', 'Rust', 'PowerShell', 'Git', 'Linux',
        'Docker', 'HTML', 'CSS', 'JavaScript', 'NoSQL', 'SQL', 'Postman', 'Swagger', 'ReadyAPI',
        'Flask', 'REST APIs', 'Scikit-learn', 'Kubernetes', 'Azure', 'AWS', 'GCP', 'CompTIA Cloud+',
        'Unit Testing', 'Test Driven Development', 'Mocked Object Testing', 'Qiskit', 'Pennylane'
    ];
    const skillsTracks = document.querySelectorAll('.skills-track > div');

    // Distribute skills into 3 tracks
    const skillsPerTrack = Math.ceil(skills.length / 3);
    const track1Skills = skills.slice(0, skillsPerTrack);
    const track2Skills = skills.slice(skillsPerTrack, skillsPerTrack * 2);
    const track3Skills = skills.slice(skillsPerTrack * 2);

    const tracks = [track1Skills, track2Skills, track3Skills];

    skillsTracks.forEach((track, index) => {
        const currentSkills = tracks[index];
        // Duplicate the array multiple times to ensure it's long enough for a seamless loop
        const duplicatedSkills = [...currentSkills, ...currentSkills, ...currentSkills, ...currentSkills];

        duplicatedSkills.forEach(skill => {
            const skillElement = document.createElement('span');
            skillElement.className = 'skill-tag tag inline-block rounded-full px-5 py-2 text-md font-semibold whitespace-nowrap';
            skillElement.textContent = skill;
            track.appendChild(skillElement);
        });
    });

    // --- Fetch Codeforces Data ---
    const cfProfileInfo = document.getElementById('cf-profile-info');
    try {
        // Fetch User Info (Profile Pic, Rating, Rank)
        const userInfoResponse = await fetch('https://codeforces.com/api/user.info?handles=gesstalt');
        const userInfoData = await userInfoResponse.json();
        if (userInfoData.status !== 'OK') throw new Error(userInfoData.comment);

        const user = userInfoData.result[0];
        const profilePicUrl = user.titlePhoto.startsWith('http') ? user.titlePhoto : `https:${user.titlePhoto}`;

        cfProfileInfo.innerHTML = `
                    <img class="h-20 w-20 rounded-full border-2 border-violet-400 object-cover" src="${profilePicUrl}" alt="Codeforces profile picture">
                    <div class="flex-grow space-y-1">
                        <p class="text-xl font-bold text-white">${user.handle}</p>
                        <p class="capitalize text-violet-300">${user.rank}</p>
                        <p class="text-gray-400">${user.rating} Elo</p>
                    </div>
                `;

        // Fetch Rating History for Chart
        const ratingResponse = await fetch('https://codeforces.com/api/user.rating?handle=gesstalt');
        const ratingData = await ratingResponse.json();
        if (ratingData.status !== 'OK') throw new Error(ratingData.comment);

        const ratingLabels = ratingData.result.map(d => new Date(d.ratingUpdateTimeSeconds * 1000).toLocaleDateString());
        const ratingValues = ratingData.result.map(d => d.newRating);

        new Chart(document.getElementById('cf-rating-chart'), {
            type: 'line',
            data: { labels: ratingLabels, datasets: [{ label: 'Rating', data: ratingValues, borderColor: '#a78bfa', backgroundColor: 'rgba(167, 139, 250, 0.2)', fill: true, tension: 0.1 }] },
            options: { scales: { y: { ticks: { color: '#9ca3af' } }, x: { ticks: { color: '#9ca3af' } } }, plugins: { legend: { display: false } } }
        });

        // Fetch Submissions for Problems Solved Chart
        const statusResponse = await fetch('https://codeforces.com/api/user.status?handle=gesstalt');
        const statusData = await statusResponse.json();
        if (statusData.status !== 'OK') throw new Error(statusData.comment);

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const monthlySolves = Array(12).fill(0);
        const solvedProblems = new Set();

        statusData.result.forEach(sub => {
            const subDate = new Date(sub.creationTimeSeconds * 1000);
            const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
            if (sub.verdict === 'OK' && subDate > oneYearAgo && !solvedProblems.has(problemId)) {
                solvedProblems.add(problemId);
                const monthIndex = subDate.getMonth();
                monthlySolves[monthIndex]++;
            }
        });

        const monthLabels = [...Array(12).keys()].map(i => {
            const date = new Date();
            date.setMonth(i, 1);
            return date.toLocaleString('default', { month: 'short' });
        });

        new Chart(document.getElementById('cf-submissions-chart'), {
            type: 'bar',
            data: { labels: monthLabels, datasets: [{ label: 'Problems Solved', data: monthlySolves, backgroundColor: '#7c3aed' }] },
            options: { scales: { y: { ticks: { color: '#9ca3af', stepSize: 1 } }, x: { ticks: { color: '#9ca3af' } } }, plugins: { legend: { display: false } } }
        });

    } catch (error) {
        console.error("Failed to fetch Codeforces data:", error);
        const cfContent = document.getElementById('codeforces-content');
        cfContent.innerHTML = `<p class="text-red-400">Could not load Codeforces data. The API might be temporarily unavailable.</p>`;
    }
});

// --- Interactive Particle Canvas Script ---
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particlesArray;

const heroSection = document.getElementById('home');
canvas.width = heroSection.clientWidth;
canvas.height = heroSection.clientHeight;

const mouse = {
    x: null,
    y: null,
    radius: (canvas.width / 10) * (canvas.height / 10)
};

window.addEventListener('mousemove', function (event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

window.addEventListener('mouseout', function () {
    mouse.x = null;
    mouse.y = null;
});

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
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

        if (mouse.x !== null && mouse.y !== null) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            const pushRadius = 80;
            if (distance < pushRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (pushRadius - distance) / pushRadius;
                const pushStrength = 2;
                this.x += forceDirectionX * force * pushStrength;
                this.y += forceDirectionY * force * pushStrength;
            }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = '#a78bfa';
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

function connect() {
    let opacityValue = 1;
    const connectionDistanceSquared = (canvas.width / 7) * (canvas.height / 7);
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
            if (distance < connectionDistanceSquared) {
                opacityValue = 1 - (distance / connectionDistanceSquared);
                ctx.strokeStyle = `rgba(167, 139, 250, ${opacityValue})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
    if (mouse.x !== null && mouse.y !== null) {
        for (let i = 0; i < particlesArray.length; i++) {
            let distance = ((particlesArray[i].x - mouse.x) ** 2) + ((particlesArray[i].y - mouse.y) ** 2);
            if (distance < mouse.radius) {
                opacityValue = 1 - (distance / mouse.radius);
                ctx.strokeStyle = `rgba(233, 213, 255, ${opacityValue})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(particlesArray[i].x, particlesArray[i].y);
                ctx.stroke();
            }
        }
    }
}

window.addEventListener('resize', function () {
    canvas.width = heroSection.clientWidth;
    canvas.height = heroSection.clientHeight;
    mouse.radius = (canvas.width / 10) * (canvas.height / 10);
    init();
});

init();
animate();