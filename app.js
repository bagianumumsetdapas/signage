const JADWAL_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSp4n-zDHZPfOaGCqIhKixQufejI4We4WseYBkK6EB574CVDe8ld8xxL69qQWg4YG68FU-rMhTLjxkS/pub?gid=1774966991&single=true&output=csv";

const RUNNING_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSp4n-zDHZPfOaGCqIhKixQufejI4We4WseYBkK6EB574CVDe8ld8xxL69qQWg4YG68FU-rMhTLjxkS/pub?gid=2010321855&single=true&output=csv";


async function fetchCSV(url){

    const res = await fetch(url);
    return await res.text();

}

function csvToArray(csv){

    const rows = csv.trim().split("\n");

    return rows.map(r => r.split(","));

}

function updateClock(){

    const now = new Date();

    document.getElementById("clockTime").textContent =
        now.toLocaleTimeString("id-ID");

    document.getElementById("clockDate").textContent =
        now.toLocaleDateString("id-ID",{
            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"
        });

}

function groupByRoom(data){

    const result = {};

    data.forEach(row => {

        const ruang = row[1];
        const peminjam = row[2];
        const mulai = row[3];
        const selesai = row[4];

        if(!result[ruang]){
            result[ruang] = [];
        }

        result[ruang].push({
            peminjam,
            mulai,
            selesai
        });

    });

    return result;

}

function renderCards(grouped){

    const container =
    document.getElementById("cardsContainer");

    const rooms =
    Object.keys(grouped);

    if(rooms.length === 0){

        container.innerHTML = `
            <div class="empty">
                <h2>Tidak Ada Peminjaman</h2>
                <p>Hari Ini</p>
            </div>
        `;

        return;
    }

    let columns = 3;

    if(rooms.length === 1) columns = 1;
    if(rooms.length === 2) columns = 2;
    if(rooms.length === 4) columns = 2;

    container.style.gridTemplateColumns =
    `repeat(${columns}, 1fr)`;

    container.innerHTML = "";

    rooms.forEach(room => {

        const schedules =
        grouped[room];

        const card =
        document.createElement("div");

        card.className = "card";

        let html = `
        <div class="room-title">${room}</div>
        `;

        schedules.forEach(item => {

            html += `
            <div class="schedule">
                <div class="schedule-time">
                    ${item.mulai} - ${item.selesai}
                </div>
                <div class="schedule-user">
                    ${item.peminjam}
                </div>
            </div>
            `;

        });

        card.innerHTML = html;

        container.appendChild(card);

    });

}

async function loadSchedule(){

    const csv = await fetchCSV(JADWAL_URL);

    const rows = csvToArray(csv);

    rows.shift();

    const grouped =
    groupByRoom(rows);

    renderCards(grouped);

}

async function loadTicker(){

    const csv = await fetchCSV(RUNNING_URL);

    const rows = csvToArray(csv);

    rows.shift();

    const texts =
    rows.map(r => r[0]).filter(Boolean);

    const speed =
    rows[0]?.[1] || 40;

    const merged =
    texts.join(" • ");

    const ticker =
    document.getElementById("ticker");

    ticker.textContent = merged;

    ticker.style.animationDuration =
    speed + "s";

}

async function requestWakeLock(){

    try{

        if("wakeLock" in navigator){

            const wakeLock =
            await navigator.wakeLock.request("screen");

            document.addEventListener(
                "visibilitychange",
                async () => {

                    if(
                        document.visibilityState === "visible"
                    ){
                        await navigator.wakeLock.request("screen");
                    }

                }
            );

        }

    }catch(err){
        console.log(err);
    }

}

function createParticles(){

    const container =
    document.querySelector(".particles");

    for(let i=0;i<40;i++){

        const p =
        document.createElement("span");

        p.style.position = "absolute";
        p.style.width = "3px";
        p.style.height = "3px";
        p.style.borderRadius = "50%";
        p.style.background = "#FFD700";

        p.style.left =
        Math.random()*100+"%";

        p.style.top =
        Math.random()*100+"%";

        p.style.opacity =
        Math.random();

        container.appendChild(p);

    }

}

createParticles();

updateClock();
setInterval(updateClock,1000);

loadSchedule();
loadTicker();

setInterval(loadSchedule,60000);
setInterval(loadTicker,60000);

requestWakeLock();