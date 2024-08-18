const apiBaseUrl = 'http://localhost:5000';
const form = document.getElementById('phaseForm');
const timelineContainer = document.getElementById('timelineContainer');
const exportButton = document.getElementById('exportTimeline');

let phases = [];

// Fetch phases from the backend on load
async function fetchPhases() {
    const response = await fetch(`${apiBaseUrl}/phases`);
    phases = await response.json();
    renderPhases();
}

function renderPhases() {
    timelineContainer.innerHTML = '';

    phases.forEach((phase, index) => {
        const phaseDiv = document.createElement('div');
        phaseDiv.classList.add('phase');
        phaseDiv.setAttribute('draggable', true);

        phaseDiv.innerHTML = `
            <div class="phase-content">
                <strong>${phase.name}</strong> - ${phase.duration} days
                <div class="bar" style="width: ${phase.duration * 10}px"></div>
            </div>
        `;

        phaseDiv.addEventListener('dragstart', () => handleDragStart(index));
        phaseDiv.addEventListener('dragover', (e) => handleDragOver(e));
        phaseDiv.addEventListener('drop', () => handleDrop(index));

        timelineContainer.appendChild(phaseDiv);
    });
}

let draggedIndex = null;

function handleDragStart(index) {
    draggedIndex = index;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(index) {
    const draggedPhase = phases.splice(draggedIndex, 1)[0];
    phases.splice(index, 0, draggedPhase);
    updatePhases();
}

function updatePhases() {
    renderPhases();

    fetch(`${apiBaseUrl}/reorder-phases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phases)
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phaseName = document.getElementById('phaseName').value;
    const duration = document.getElementById('duration').value;

    const newPhase = { name: phaseName, duration: parseInt(duration) };

    const response = await fetch(`${apiBaseUrl}/phases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhase)
    });

    const addedPhase = await response.json();
    phases.push(addedPhase);
    updatePhases();

    form.reset();
});

exportButton.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(phases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timeline.json';
    a.click();
});

fetchPhases();


