let menuData = null;
let currentMonday = getMonday(new Date());

function getMonday(d) {
    d = new Date(d);
    const day = d.getDay(); 
    // Si es Sábado (6) o Domingo (0), saltamos al lunes de la semana que viene
    if (day === 6) d.setDate(d.getDate() + 2);
    if (day === 0) d.setDate(d.getDate() + 1);
    
    const updatedDay = d.getDay();
    const diff = d.getDate() - updatedDay + (updatedDay === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
}

function resetToToday() {
    currentMonday = getMonday(new Date());
    render();
}

async function loadMenu() {
    // Usamos la ruta relativa
    const url = 'menu_mira.json'; 
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error de red');
        menuData = await response.json();
        render();
    } catch (err) {
        document.getElementById('app').innerHTML = `
            <div class="error">
                ⚠️ No se pudieron cargar los menús.<br>
                Asegúrate de que 'menu_mira.json' esté en la misma carpeta.
            </div>`;
    }
}

function getMenuForDate(date) {
    if (!menuData) return "---";
    const pad = (n) => n.toString().padStart(2, '0');
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const candidates = [
        `${y}-${pad(m)}-${pad(d)}`, 
        `${pad(d)}/${pad(m)}/${y}`, 
        `${pad(d)}-${pad(m)}-${y}`, 
        `${d}/${m}/${y}`
    ];

    if (Array.isArray(menuData)) {
        const found = menuData.find(item => candidates.includes(item.fecha || item.date || item.dia));
        return found ? (found.menu || found.comida || found.texto) : "---";
    }
    return "---";
}

function render() {
    const container = document.getElementById('app');
    const info = document.getElementById('week-info');
    if (!container || !info) return;

    container.innerHTML = '';

    const endOfWeek = new Date(currentMonday);
    endOfWeek.setDate(currentMonday.getDate() + 4);
    const options = { day: 'numeric', month: 'short' };
    info.innerHTML = `SEMANA DEL<br>${currentMonday.toLocaleDateString('es-ES', options)} AL ${endOfWeek.toLocaleDateString('es-ES', options)}`.toUpperCase();

    const todayStr = new Date().toDateString();

    for (let i = 0; i < 5; i++) {
        const date = new Date(currentMonday);
        date.setDate(currentMonday.getDate() + i);
        
        let menuText = getMenuForDate(date);
        if (menuText === "---") menuText = "<i style='color:var(--muted)'>Sin menú registrado</i>";

        const isToday = date.toDateString() === todayStr;
        const card = document.createElement('div');
        card.className = `day-card ${isToday ? 'today' : ''}`;
        
        const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
        const dateNum = date.toLocaleDateString('es-ES');

        card.innerHTML = `
            <div class="day-header">
                <span class="day-name">
                    ${dayName} ${isToday ? '<span class="today-badge">HOY</span>' : ''}
                </span>
                <span class="day-date">${dateNum}</span>
            </div>
            <div class="menu-body">${menuText}</div>
        `;
        container.appendChild(card);
    }
}

function changeWeek(days) {
    currentMonday.setDate(currentMonday.getDate() + days);
    render();
}

// Arrancar la aplicación
loadMenu();
