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
    const url = 'menu_mira.json';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error de red');
        const rawData = await response.json();
        
        // Convertimos el array en un objeto de búsqueda rápida
        menuData = {}; 
        rawData.forEach(item => {
            // Extraemos la fecha y el contenido del menú
            const fecha = item.fecha || item.date || item.dia;
            const contenido = item.menu || item.comida || item.texto;
            if (fecha) {
                menuData[fecha] = contenido;
            }
        });
        
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

    // Generamos los formatos posibles de fecha
    const candidates = [
        `${y}-${pad(m)}-${pad(d)}`, // 2026-04-05
        `${pad(d)}/${pad(m)}/${y}`, // 05/04/2026
        `${pad(d)}-${pad(m)}-${y}`, // 05-04-2026
        `${d}/${m}/${y}`            // 5/4/2026
    ];

    // Buscamos directamente en el objeto (mucho más rápido)
    for (let c of candidates) {
        if (menuData[c]) return menuData[c];
    }
    
    return "---";
}

function render_bak() {
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

        const shareText = encodeURIComponent(`*Menú ${dayName} (${dateNum})*\n${menuText}\n\n📍 CEIP Miraflores`);
        const whatsappUrl = `https://wa.me/?text=${shareText}`;

        card.innerHTML = `
            <div class="day-header">
                <span class="day-name">
                    ${dayName} ${isToday ? '<span class="today-badge">HOY</span>' : ''}
                </span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="day-date">${dateNum}</span>
                    <a href="${whatsappUrl}" target="_blank" style="text-decoration:none; font-size: 1.1rem; line-height: 1;" title="Compartir">
                        💬
                    </a>
                </div>
            </div>
            <div class="menu-body">${menuText}</div>
        `;

    }
    
    const todayCard = document.querySelector('.day-card.today');
    if (todayCard) {
        todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
        
        // 1. Obtenemos el menú original
        const rawMenu = getMenuForDate(date);
        const hasMenu = rawMenu !== "---";

        // 2. Preparamos el texto para mostrar (con cursiva si no hay nada)
        const displayMenu = hasMenu ? rawMenu : "<i style='color:var(--muted)'>Sin menú registrado</i>";

        // 3. Generamos el HTML del botón SOLO si hay menú
        let shareHtml = '';
        const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
        const dateNum = date.toLocaleDateString('es-ES');

        if (hasMenu) {
            const hr = "─".repeat(25);
            const appUrl = "menumiraflores.vercel.app";

            const shareText = encodeURIComponent(
                `*🍽️ Menú Miraflores* _(${dayName} - ${dateNum})_\n` +
                `${hr}\n` +
                `${rawMenu}\n\n` +
                `🌐 Ver más: ${appUrl}`
            );

            const whatsappUrl = `https://wa.me/?text=${shareText}`;
            shareHtml = `
                <a href="${whatsappUrl}" target="_blank" style="text-decoration:none; font-size: 1.1rem; line-height: 1;" title="Compartir">
                    💬
                </a>`;
        }

        const isToday = date.toDateString() === todayStr;
        const card = document.createElement('div');
        card.className = `day-card ${isToday ? 'today' : ''}`;
        
        card.innerHTML = `
            <div class="day-header">
                <span class="day-name">
                    ${dayName} ${isToday ? '<span class="today-badge">HOY</span>' : ''}
                </span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="day-date">${dateNum}</span>
                    ${shareHtml}
                </div>
            </div>
            <div class="menu-body">${displayMenu}</div>
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
