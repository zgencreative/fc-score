document.addEventListener("DOMContentLoaded", function () {
  if (typeof currentPage !== "undefined") {
    reloadInitialView();

    if (currentPage === "home") {
      generateCalendar();
      fetchSortedData();
    } else if (currentPage === "match") {
      // Ambil path dari URL
      const currentPath = window.location.pathname; // Contoh: "/match/1251295"
      const segments = currentPath.split("/"); // ["", "match", "1251295"]
      const idTable = `${segments[2]}.${segments[3]}`;
      const id = segments[segments.length - 2]; // Ambil elemen terakhir sebagai ID ("1251295")
      const keyTitles = {
        blsh: "Blocked Shot",
        catt: "Counter Attack",
        crs: "Corner Kicks",
        fls: "Fouls",
        gks: "Goalkeeper Saves",
        goa: "Goal kicks",
        ofs: "Offsides",
        pss: "Posession (%)",
        shof: "Shots Off Target",
        shon: "Shots On Target",
        ths: "Throw ins",
        ycs: "Yellow Cards",
        rcs: "Red Cards",
      };

      // Pastikan ID valid sebelum melanjutkan
      if (!id) {
        console.error("ID not found in the URL!");
        return;
      }

      const summary_link = document.getElementById("summary-link");
      summary_link.href = currentPath;

      // Daftar link dengan endpoint dinamis
      const links = [
        {
          id: "stats-link",
          endpoint: (id) => `/api/football/detailMatch/stat/${id}/`,
        },
        {
          id: "lineups-link",
          endpoint: (id) => `/api/football/detailMatch/lineup/${id}/`,
        },
        {
          id: "table-link",
          endpoint: (id) => `/api/football/detailMatch/table/${idTable}/`,
        },
      ];

      // Iterasi setiap link dan tambahkan event listener
      links.forEach((link) => {
        const element = document.getElementById(link.id);

        // Pastikan elemen dengan ID tersebut ada
        if (!element) {
          console.warn(`Element with ID "${link.id}" not found.`);
          return;
        }

        // Tambahkan event listener ke elemen
        element.addEventListener("click", function (event) {
          event.preventDefault(); // Cegah tindakan default (misalnya, navigasi <a>)

          // Hapus class active dari semua elemen lainnya
          summary_link.classList.remove("active");
          links.forEach((otherLink) => {
            const otherElement = document.getElementById(otherLink.id);
            if (otherElement && otherElement.classList.contains("active")) {
              otherElement.classList.remove("active");
            }
          });

          // Tambahkan class active ke elemen yang diklik
          element.classList.add("active");

          // Kirim fetch request ke endpoint
          fetch(link.endpoint(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              const container = document.getElementById("dinamic-content");
              container.innerHTML = "";
              if (link.id == "stats-link") {
                const match = data.data[0];

                // Looping untuk menghitung persentase dan menampilkan hasil
                for (const key in match.sum_stat[0]) {
                  const value0 = match.sum_stat[0][key] || 0;
                  const value1 = match.sum_stat[1][key] || 0;
                  const total = value0 + value1;

                  if (total > 0) {
                    const value0Percent = Math.round((value0 / total) * 100);
                    const value1Percent = Math.round((value1 / total) * 100);
                    const remaining0 = 100 - value0Percent;
                    const remaining1 = 100 - value1Percent;

                    // Buat elemen wrapper untuk setiap statistik
                    const statWrapper = document.createElement("div");

                    // Bagian atas
                    statWrapper.innerHTML += `
                      <div class="d-flex justify-content-between py-2">
                        <span class="text-light">${value0}</span>
                        <span class="stat-label">${keyTitles[key] || key}</span>
                        <span class="text-light">${value1}</span>
                      </div>
                      <div class="d-flex justify-content-between">
                        <div class="pe-1 gap-1 d-flex justify-content-between w-50">
                          <div class="dot-white rounded-start" style="width: ${remaining0}%;"></div>
                          <div class="dot-orange rounded-end" style="width: ${value0Percent}%;"></div>
                        </div>
                        <div class="ps-1 gap-1 d-flex justify-content-between w-50">
                          <div class="dot-orange rounded-start" style="width: ${value1Percent}%;"></div>
                          <div class="dot-white rounded-end" style="width: ${remaining1}%;"></div>
                        </div>
                        </div>
                      </div>
                    `;

                    // Tambahkan wrapper ke container
                    container.appendChild(statWrapper);
                  }
                }
              } else if (link.id == "lineups-link") {
                const positionsTeam1 = {
                  1: { x: [47], y: "5%" },
                  2: { x: [26, 66], y: "17%" },
                  3: { x: [16, 47, 76], y: "25%" },
                  4: { x: [11, 31, 61, 81], y: "35%" },
                  5: { x: [8, 26, 47, 68, 86], y: "42%" },
                };
                const positionsTeam2 = {
                  1: { x: [47], y: "91%" },
                  2: { x: [26, 66], y: "79%" },
                  3: { x: [16, 47, 76], y: "71%" },
                  4: { x: [11, 31, 61, 81], y: "61%" },
                  5: { x: [8, 26, 47, 68, 86], y: "54%" },
                };
                const team1 = data.data.Team1;
                const team2 = data.data.Team2;
                const name_team1 =
                  document.getElementsByClassName("team-nameMatch")[0]
                    .innerText;
                const name_team2 =
                  document.getElementsByClassName("team-nameMatch")[1]
                    .innerText;
                const field_container = document.createElement("div");
                field_container.classList.add("field-container");
                field_container.innerHTML = `
                <img
                  src="/static/img/lapangan_posisi.png"
                  alt="Soccer Field"
                  style="opacity: 0.6;"
                  class="field-image"
                />
                <div class="name-team" style="top: 1%; left: 6%">
                  <b>${name_team1}</b> ${team1.Fo.join("-")}
                </div>
                <div class="name-team" style="top: 96%; left: 6%">
                  <b>${name_team2}</b> ${team2.Fo.join("-")}
                </div>
                `;
                container.appendChild(field_container);
                createPlayerElements(team1, positionsTeam1, "team1");
                createPlayerElements(team2, positionsTeam2, "team2");
                createSubs(team1, team2);
                createSubsPlayer(team1, team2);
                createIS(team1, team2);
                createCoach(team1, team2);
              } else if (link.id == "table-link") {
                const name_team1 =
                  document.getElementsByClassName("team-nameMatch")[0]
                    .innerText;
                const name_team2 =
                  document.getElementsByClassName("team-nameMatch")[1]
                    .innerText;
                const tableRank = data.data.LeagueTable;
                const tableContainer = document.createElement("div");
                tableContainer.style.margin = "12px 0 12px";

                // Menambahkan tabel dengan struktur HTML
                tableContainer.innerHTML = `
                  <table>
                    <thead>
                      <tr>
                        <th style="font-weight: 500; width: 5%">#</th>
                        <th class="col-team" style="width: 40%; color: white">TEAM</th>
                        <th class="col-p" style="width: 7.5%; color: white">P</th>
                        <th class="col-w"style="width: 7.5%; color: white">W</th>
                        <th class="col-d"style="width: 7.5%; color: white">D</th>
                        <th class="col-l"style="width: 7.5%; color: white">L</th>
                        <th class="col-f"style="width: 7.5%; color: white">F</th>
                        <th class="col-a"style="width: 7.5%; color: white">A</th>
                        <th class="col-gd"style="width: 7.5%; color: white">GD</th>
                        <th class="col-pts"style="width: 7.5%; color: white">PTS</th>
                      </tr>
                    </thead>
                    <tbody id="rankTable"></tbody>
                  </table>
                `;

                // Menambahkan tableContainer ke dalam container utama
                container.appendChild(tableContainer);

                // Menyiapkan tbody untuk menambahkan data tim
                const rankTable = document.getElementById("rankTable");

                // Menggunakan loop untuk menambahkan data ke dalam table
                tableRank.forEach((team) => {
                  // Membuat baris baru (tr) untuk setiap tim
                  const row = document.createElement("tr");
                  row.classList.add("bg-dark-1");

                  if (team.teamNM === name_team1 || team.teamNM === name_team2) {
                    row.classList.add("highlighted"); 
                  } else {
                    row.classList.remove("bg-dark-1");
                  }
                  // if (team.teamNM != name_team1 && team.teamNM != name_team2) {
                  //   row.classList.remove("bg-black");
                  // }

                  row.style.fontSize = "14px";

                  // Menambahkan data ke dalam setiap sel (td)
                  row.innerHTML = `
                    <td style="font-weight: 500; width: 5%; color: white">${team.rank}</td>
                    <td style="width: 40%; color: white">
                      <img
                        loading="lazy"
                        src="${team.teamIMG}"
                        class="icon"
                        style="height: 30px; width: 30px"
                      />
                      ${team.teamNM}
                    </td>
                    <td style="width: 7.5%; color: white">${team.p}</td>
                    <td style="width: 7.5%; color: white">${team.w}</td>
                    <td style="width: 7.5%; color: white">${team.d}</td>
                    <td style="width: 7.5%; color: white">${team.l}</td>
                    <td style="width: 7.5%; color: white">${team.f}</td>
                    <td style="width: 7.5%; color: white">${team.a}</td>
                    <td style="width: 7.5%; color: white">${team.gd}</td>
                    <td style="width: 7.5%; color: white">${team.pts}</td>
                  `;

                  // Menambahkan baris baru ke dalam tbody
                  rankTable.appendChild(row);
                });
              } else {
                console.error("Container element not found!");
              }
            })
            .catch((error) => {
              console.error(`Error fetching ${link.endpoint(id)}:`, error);
            });
        });
      });
    } else if (currentPage === "comp") {
      const links = [
        {
          id: "overview-link",
        },
        {
          id: "matches-link",
        },
        {
          id: "table-link",
        },
      ];
      overview(data.data);
      // Iterasi setiap link dan tambahkan event listener
      links.forEach((link) => {
        const element = document.getElementById(link.id);

        // Pastikan elemen dengan ID tersebut ada
        if (!element) {
          console.warn(`Element with ID "${link.id}" not found.`);
          return;
        }

        // Tambahkan event listener ke elemen
        element.addEventListener("click", function (event) {
          event.preventDefault(); // Cegah tindakan default (misalnya, navigasi <a>)

          // Hapus class active dari semua elemen lainnya
          element.classList.remove("active");
          links.forEach((otherLink) => {
            const otherElement = document.getElementById(otherLink.id);
            if (otherElement && otherElement.classList.contains("active")) {
              otherElement.classList.remove("active");
            }
          });

          // Tambahkan class active ke elemen yang diklik
          element.classList.add("active");

          if (link.id == "overview-link") {
            overview(data.data);
          } else if (link.id == "matches-link") {
            matches(data.data.Events, "FIXTURES", data.data.urlComp);
          } else if (link.id == "table-link") {
            tables(data.data.LeagueTable);
          } else {
            console.error("404");
          }
        });
      });
    } else if (currentPage === "team") {
      matches(data);
    }
  }
});

// Fungsi untuk memindahkan konten ketika ukuran halaman berubah
function moveContent() {
  const content = document.getElementById("leftSide");
  const newContainer = document.getElementById("new_search");

  // Cek jika lebar viewport lebih kecil atau sama dengan 600px
  if (window.innerWidth <= 720) {
    // Pindahkan konten ke #new-container jika ukuran layar kecil
    newContainer.appendChild(content);
  } else {
    // Kembalikan konten ke posisi semula jika layar lebih besar dari 600px
    document.getElementById("main-search").appendChild(content);
  }
}

// Panggil fungsi saat halaman dimuat dan saat ukuran jendela berubah
window.addEventListener("resize", moveContent);
window.addEventListener("load", moveContent);

// Variabel untuk melacak status aktif dan filter kompetisi
let activeView = "fixtures"; // Variabel untuk menandakan apakah kita sedang melihat "Fixtures" atau "Results"
let selectedComp = "all"; // Variabel untuk menandakan kompetisi yang dipilih (default 'all')

// Fungsi untuk mengubah tampilan antara "Fixtures" dan "Results"
function changeCompetition(index, filter, stages) {
  const button1 = document.getElementById("btnFixtures");
  const button2 = document.getElementById("btnResults");

  // Update tombol yang aktif
  let SM = "FT"; // Default tampilkan hasil (FT)
  if (filter === "FIXTURES") {
    SM = "NS"; // Tampilkan jadwal (NS)
    button1.classList.add("active");
    button2.classList.remove("active");
  } else {
    button1.classList.remove("active");
    button2.classList.add("active");
  }

  // Menangani klik tombol Fixtures atau Results
  button1.addEventListener("click", () => {
    activeView = "fixtures"; // Set activeView ke "fixtures"
    updateMatches(); // Memperbarui data yang ditampilkan
  });
  button2.addEventListener("click", () => {
    activeView = "results"; // Set activeView ke "results"
    updateMatches(); // Memperbarui data yang ditampilkan
  });

  // Update judul dropdown dengan kompetisi yang dipilih
  document.getElementById(
    "dropdownBtn"
  ).innerHTML = `${stages[index].Snm} <span>&#9662;</span>`;

  // Mengubah konten berdasarkan kompetisi yang dipilih
  const formSection = document.getElementById("dinamic-comp");
  formSection.innerHTML = ""; // Kosongkan konten sebelumnya
  const stageDiv = document.createElement("div");

  // Menambahkan judul untuk setiap stage
  const titleDetail = document.createElement("div");
  titleDetail.classList.add(
    "title-detail",
    "d-flex",
    "justify-content-between"
  );
  titleDetail.innerHTML = `
        <span>${stages[index].Snm}</span><i class="fas fa-angle-right"></i>
    `;
  stageDiv.appendChild(titleDetail);

  // Daftar pertandingan untuk setiap stage
  const listForm = document.createElement("div");
  listForm.classList.add("list-form");

  // Menambahkan pertandingan ke dalam daftar
  stages[index].events.forEach((match) => {
    // Tentukan apakah pertandingan sesuai dengan tampilan aktif
    const isFixture = activeView === "fixtures" && match.Status_Match === "NS"; // Hanya tampilkan pertandingan belum ada skor
    const isResult = activeView === "results" && match.Status_Match === "FT"; // Hanya tampilkan pertandingan yang sudah ada skor

    // Jika pertandingan tidak sesuai dengan status aktif, lanjutkan ke iterasi berikutnya
    if (!(isFixture || isResult)) return;

    const cardForm = document.createElement("div");
    cardForm.classList.add("card-form", "mt-2", "mb-2");

    const infoForm = document.createElement("div");
    infoForm.classList.add("info-form");

    // Detail pertandingan
    infoForm.innerHTML = `
            <div class="status-match">${match.Status_Match}</div>
            <div class="info-teamForm">
                <div class="team1-detail">
                    <img loading="lazy" src="${match.Team1.IMGTeam}" class="icon" style="height: 30px; width: 30px" />
                    <div class="name-team-detail">${match.Team1.NMTeam}</div>
                </div>
                <div class="team2-detail">
                    <img loading="lazy" src="${match.Team2.IMGTeam}" class="icon" style="height: 30px; width: 30px" />
                    <div class="name-team-detail">${match.Team2.NMTeam}</div>
                </div>
            </div>
        `;
    cardForm.appendChild(infoForm);

    const infoForm2 = document.createElement("div");
    infoForm2.classList.add("info-form");

    // Jika pertandingan sudah selesai (FT), tampilkan skor
    if (match.Status_Match === "FT") {
      const scoreForm = document.createElement("div");
      scoreForm.classList.add("info-teamForm");
      scoreForm.innerHTML = `
                <div class="score-form" style="margin-bottom: 20px">${match.Score1}</div>
                <div class="score-form">${match.Score2}</div>
            `;
      infoForm2.appendChild(scoreForm);
    }

    // Menambahkan status favorit
    const statusFavorite = document.createElement("div");
    statusFavorite.classList.add("status-favorite");
    statusFavorite.innerHTML = `
            <img loading="lazy" src="/static/img/star_border.png" class="icon" style="height: 36px; width: 36px" />
        `;
    infoForm2.appendChild(statusFavorite);
    cardForm.appendChild(infoForm2);

    listForm.appendChild(cardForm);
  });

  stageDiv.appendChild(listForm);
  formSection.appendChild(stageDiv);
}

// Fungsi untuk memperbarui tampilan pertandingan berdasarkan tombol yang aktif dan filter kompetisi
function updateMatches() {
  // Mengambil data pertandingan dari backend (contoh: API atau data statis)
  const stages = []; // Data stages yang berisi pertandingan-pertandingan untuk setiap kompetisi
  const index = 0; // Indeks kompetisi yang sedang dipilih
  changeCompetition(index, activeView, stages);
}

function overview(data) {
  const container = document.getElementById("dinamic-content");
  container.innerHTML = "";

  // Title Section
  const titleSection = document.createElement("div");
  titleSection.classList.add("d-flex", "justify-content-between");
  titleSection.innerHTML = `<span>FIXTURES</span>`;
  container.appendChild(titleSection);

  // Main Section
  const mainSection = document.createElement("div");
  mainSection.classList.add("grid-container");
  container.appendChild(mainSection);

  let num = 0;
  for (let i = 0; i < data.Events.length; i++) {
    if (data.Events[i].Status_Match == "NS" && num <= 2) {
      num++;

      const event = data.Events[i];
      const team1 = event.Team1;
      const team2 = event.Team2;
      const matchTime = formatTimestamp(event.time_start);

      // Creating Match Card
      const matchCard = document.createElement("div");
      matchCard.classList.add("card");

      matchCard.innerHTML = `
              <div class="component-1">
                <div class="d-flex justify-content-between ms-3 me-3 py-3">
                  <div class="live-wrapper">
                      <b class="live">${event.Status_Match}</b>
                  </div>
                  <span class="team-score">
                    <div class="star-container" onclick="toggleStar(this)">
                      <img src="/static/img/star_border.png" class="star default" alt="Star Border">
                      <img src="/static/img/star.png" class="star filled" alt="Star Filled">
                    </div>
                  </span>
                </div>
                <div class="frame-group">
                  <div class="chelsea-fcsvg-parent">
                      <img class="chelsea-fcsvg-icon" alt="${team1.NMTeam}" src="${team1.IMGTeam}">
                      
                      <i class="vs">VS</i>
                      <img class="chelsea-fcsvg-icon" alt="${team2.NMTeam}" src="${team2.IMGTeam}">
                      
                  </div>
                  <div class="frame-container">
                      <div class="nd-round-parent">
                        <i class="nd-round"></i>
                        <i class="nd-round"></i>
                      </div>
                      <div class="spacing-line" ></div>
                  </div>
                  <div class="frame-div">
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${team1.NMTeam}</div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${team2.NMTeam}</div>
                    </div>
                    <img class="group-item" alt="" src="/static/img/Line 244.png">
                  </div>
                </div>
                <div class="button-primary">
                    <b class="button"><img alt="" src="/static/img/calendar_card.png"> ${matchTime}</b>
                </div>
              </div>
            `;
      // Tambahkan event listener untuk mengarahkan ke URL
      matchCard.addEventListener("click", () => {
        window.location.href = `/match/${data.urlComp}/${event.IDMatch}`; // Gunakan data.url sebagai target URL
      });

      // Opsional: Tambahkan gaya kursor agar pengguna tahu card dapat diklik
      matchCard.style.cursor = "pointer";

      // Append the match card to main section
      mainSection.appendChild(matchCard);
    }
  }

  // Footer Section
  const footertSection = document.createElement("div");
  footertSection.classList.add("d-flex", "justify-content-between");
  footertSection.innerHTML = `
        <div class="progress-dots">
          <div class="progress-bar-orange rounded"></div>
          <div class="dot rounded"></div>
          <div class="dot rounded"></div>
          <div class="dot rounded"></div>
        </div>
        <!-- Show All -->
        <p class="show-all" id="show-all-fix">Show All</p>
    `;
  container.appendChild(footertSection);

  document.getElementById("show-all-fix").addEventListener("click", () => {
    matches(data.Events, "FIXTURES", data.urlComp); // Calls the 'tables' function with the LeagueTable data
  });

  // Title2 Section
  const title2Section = document.createElement("div");
  title2Section.classList.add("d-flex", "justify-content-between");
  title2Section.innerHTML = `<span>RESULTS</span>`;
  container.appendChild(title2Section);

  // Main2 Section
  const main2Section = document.createElement("div");
  main2Section.classList.add("grid-container");
  container.appendChild(main2Section);

  let num2 = 0;
  for (let i = 0; i < data.Events.length; i++) {
    if (data.Events[i].Status_Match == "FT" && num2 <= 2) {
      num2++;

      const event = data.Events[i];
      const team1 = event.Team1;
      const team2 = event.Team2;
      const matchTime = formatTimestamp(event.time_start);

      // Creating Match Card
      const matchCard = document.createElement("div");
      matchCard.classList.add("card");

      matchCard.innerHTML = `
                <div class="component-1">
                <div class="d-flex justify-content-between ms-3 me-3 py-3">
                  <div class="live-wrapper">
                      <b class="live">${event.Status_Match}</b>
                  </div>
                  <span class="team-score">
                    <div class="star-container" onclick="toggleStar(this)">
                      <img src="/static/img/star_border.png" class="star default" alt="Star Border">
                      <img src="/static/img/star.png" class="star filled" alt="Star Filled">
                    </div>
                  </span>
                </div>
                <div class="frame-group">
                  <div class="chelsea-fcsvg-parent">
                      <img class="chelsea-fcsvg-icon" alt="${team1.NMTeam}" src="${team1.IMGTeam}">
                      
                      <i class="vs">VS</i>
                      <img class="chelsea-fcsvg-icon" alt="${team2.NMTeam}" src="${team2.IMGTeam}">
                      
                  </div>
                  <div class="frame-container">
                      <div class="nd-round-parent">
                        <i class="nd-round"></i>
                        <i class="nd-round"></i>
                      </div>
                      <div class="spacing-line" ></div>
                  </div>
                  <div class="frame-div">
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${team1.NMTeam}</div>
                        <span class="team-score">${event.Score1}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${team2.NMTeam}</div>
                        <span class="team-score">${event.Score2}</span>
                    </div>
                    <img class="group-item" alt="" src="/static/img/Line 244.png">
                  </div>
                </div>
                <div class="button-primary">
                    <b class="button"><img alt="" src="/static/img/calendar_card.png"> ${matchTime}</b>
                </div>
              </div>
            `;

      // Append the match card to main section
      main2Section.appendChild(matchCard);
    }
  }

  // Footer2 Section
  const footer2Section = document.createElement("div");
  footer2Section.classList.add("d-flex", "justify-content-between");
  footer2Section.innerHTML = `
        <div class="progress-dots">
          <div class="progress-bar-orange rounded"></div>
          <div class="dot rounded"></div>
          <div class="dot rounded"></div>
          <div class="dot rounded"></div>
        </div>
        <!-- Show All -->
        <p class="show-all" id="show-all-res">Show All</p>
    `;
  container.appendChild(footer2Section);

  document.getElementById("show-all-res").addEventListener("click", () => {
    matches(data.Events, "RESULTS", data.urlComp); // Calls the 'tables' function with the LeagueTable data
  });

  // Title3 Section
  const title3Section = document.createElement("div");
  title3Section.classList.add("d-flex", "justify-content-between");
  title3Section.innerHTML = `<span>TABLE</span>`;
  container.appendChild(title3Section);

  // Main3 Section
  const tableContainer = document.createElement("div");
  tableContainer.style.margin = "12px 0 12px";

  // Menambahkan tabel dengan struktur HTML
  tableContainer.innerHTML = `
        <table>
        <thead>
          <tr>
              <th style="font-weight: 500; width: 5%">#</th>
              <th class="col-team" style="width: 40%; color: white">TEAM</th>
              <th class="col-p" style="width: 7.5%; color: white">P</th>
              <th class="col-w"style="width: 7.5%; color: white">W</th>
              <th class="col-d"style="width: 7.5%; color: white">D</th>
              <th class="col-l"style="width: 7.5%; color: white">L</th>
              <th class="col-f"style="width: 7.5%; color: white">F</th>
              <th class="col-a"style="width: 7.5%; color: white">A</th>
              <th class="col-gd"style="width: 7.5%; color: white">GD</th>
              <th class="col-pts"style="width: 7.5%; color: white">PTS</th>
            </tr>
        </thead>
        <tbody id="rankTable"></tbody>
        </table>
    `;

  // Menambahkan tableContainer ke dalam container utama
  container.appendChild(tableContainer);

  // Menyiapkan tbody untuk menambahkan data tim
  const rankTable = document.getElementById("rankTable");
  const tableRank = data.LeagueTable;
  let num3 = 0;

  // Menggunakan loop untuk menambahkan data ke dalam table
  tableRank.forEach((team) => {
    // Membuat baris baru (tr) untuk setiap tim
    if (num3 <= 4) {
      const row = document.createElement("tr");
      row.style.fontSize = "14px";

      // Menambahkan data ke dalam setiap sel (td)
      row.innerHTML = `
        <td style="font-weight: 500; width: 5%; color: white">${team.rank}</td>
        <td style="width: 40%; color: white">
                <img
                  loading="lazy"
                  src="${team.teamIMG}"
                  class="icon"
                  style="height: 30px; width: 30px"
                />
                ${team.teamNM}
              </td>
              <td style="width: 7.5%; color: white">${team.p}</td>
              <td style="width: 7.5%; color: white">${team.w}</td>
              <td style="width: 7.5%; color: white">${team.d}</td>
              <td style="width: 7.5%; color: white">${team.l}</td>
              <td style="width: 7.5%; color: white">${team.f}</td>
              <td style="width: 7.5%; color: white">${team.a}</td>
              <td style="width: 7.5%; color: white">${team.gd}</td>
              <td style="width: 7.5%; color: white">${team.pts}</td>
        `;

      // Menambahkan baris baru ke dalam tbody
      rankTable.appendChild(row);
    }
    num3++;
  });

  // Footer3 Section
  const footer3Section = document.createElement("div");
  footer3Section.classList.add("d-flex", "justify-content-between");
  footer3Section.innerHTML = `
        <div class="progress-dots">
          <div class="progress-bar-orange rounded"></div>
          <div class="dot rounded"></div>
          <div class="dot rounded"></div>
          <div class="dot rounded"></div>
        </div>
        <!-- Show All -->
        <p class="show-all" id="show-all-rank">Show All</p>
    `;
  container.appendChild(footer3Section);

  document.getElementById("show-all-rank").addEventListener("click", () => {
    tables(data.LeagueTable); // Calls the 'tables' function with the LeagueTable data
  });
}

function matches(data, tipe, urlComp) {
  const container = document.getElementById("dinamic-content");
  container.innerHTML = "";

  // Ambil elemen dengan id "table-link"
  var links_id = document.getElementById("matches-link");

  // Ambil semua elemen dengan class "menu-link"
  var menu_class = document.getElementsByClassName("menu-link");

  // Pertama, hapus kelas "active" dari semua elemen yang memiliki class "menu-link"
  for (var i = 0; i < menu_class.length; i++) {
    menu_class[i].classList.remove("active");
  }

  // Kemudian, tambahkan kelas "active" pada elemen yang dipilih
  links_id.classList.add("active");

  const button1 = document.createElement("button");
  button1.classList.add("button-matchesDetailTeam");
  button1.textContent = "FIXTURES";
  const button2 = document.createElement("button");
  button2.classList.add("button-matchesDetailTeam", "active");
  button2.textContent = "RESULTS";

  let SM = "FT";
  if (tipe == "FIXTURES") {
    SM = "NS";
    button1.classList.add("active");
    button2.classList.remove("active");
  }
  container.appendChild(button1);
  button1.addEventListener("click", () => {
    matches(data, "FIXTURES", urlComp); // Calls the 'tables' function with the LeagueTable data
  });

  container.appendChild(button2);
  button2.addEventListener("click", () => {
    matches(data, "RESULTS", urlComp); // Calls the 'tables' function with the LeagueTable data
  });

  // Main2 Section
  const main2Section = document.createElement("div");
  main2Section.classList.add("grid-container");
  container.appendChild(main2Section);

  for (let i = 0; i < data.length; i++) {
    const event = data[i];
    let score1Html = "";
    let score2Html = "";
    // Cek apakah event.Score1 ada isinya
    if (
      event.Score1 !== null &&
      event.Score1 !== undefined &&
      event.Score1 !== ""
    ) {
      score1Html = `<span class="team-score">${event.Score1}</span>`; // Tampilkan jika ada
    }

    // Cek apakah event.Score2 ada isinya
    if (
      event.Score2 !== null &&
      event.Score2 !== undefined &&
      event.Score2 !== ""
    ) {
      score2Html = `<span class="team-score">${event.Score2}</span>`; // Tampilkan jika ada
    }
    if (data[i]["Status_Match"] == SM) {
      const team1 = event.Team1;
      const team2 = event.Team2;
      const matchTime = formatTimestamp(event.time_start);

      // Creating Match Card
      const matchCard = document.createElement("div");
      matchCard.classList.add("card");

      matchCard.innerHTML = `
                <div class="component-1">
                <div class="d-flex justify-content-between ms-3 me-3 py-3">
                  <div class="live-wrapper">
                      <b class="live">${event.Status_Match}</b>
                  </div>
                  <span class="team-score">
                    <div class="star-container" onclick="toggleStar(this)">
                      <img src="/static/img/star_border.png" class="star default" alt="Star Border">
                      <img src="/static/img/star.png" class="star filled" alt="Star Filled">
                    </div>
                  </span>
                </div>
                <div class="frame-group">
                  <div class="chelsea-fcsvg-parent">
                      <img class="chelsea-fcsvg-icon" alt="${team1.NMTeam}" src="${team1.IMGTeam}">
                      
                      <i class="vs">VS</i>
                      <img class="chelsea-fcsvg-icon" alt="${team2.NMTeam}" src="${team2.IMGTeam}">
                      
                  </div>
                  <div class="frame-container">
                      <div class="nd-round-parent">
                        <i class="nd-round"></i>
                        <i class="nd-round"></i>
                      </div>
                      <div class="spacing-line" ></div>
                  </div>
                  <div class="frame-div">
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${team1.NMTeam}</div>
                        ${score1Html}
                    </div>
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${team2.NMTeam}</div>
                        ${score2Html}
                    </div>
                    <img class="group-item" alt="" src="/static/img/Line 244.png">
                  </div>
                </div>
                <div class="button-primary">
                    <b class="button"><img alt="" src="/static/img/calendar_card.png"> ${matchTime}</b>
                </div>
              </div>
            `;
      // Tambahkan event listener untuk mengarahkan ke URL
      matchCard.addEventListener("click", () => {
        window.location.href = `/match/${urlComp}/${event.IDMatch}`; // Gunakan data.url sebagai target URL
      });

      // Opsional: Tambahkan gaya kursor agar pengguna tahu card dapat diklik
      matchCard.style.cursor = "pointer";

      // Append the match card to main section
      main2Section.appendChild(matchCard);
    }
  }
}

function tables(data) {
  const container = document.getElementById("dinamic-content");

  container.innerHTML = "";
  // Ambil elemen dengan id "table-link"
  var links_id = document.getElementById("table-link");

  // Ambil semua elemen dengan class "menu-link"
  var menu_class = document.getElementsByClassName("menu-link");

  // Pertama, hapus kelas "active" dari semua elemen yang memiliki class "menu-link"
  for (var i = 0; i < menu_class.length; i++) {
    menu_class[i].classList.remove("active");
  }

  // Kemudian, tambahkan kelas "active" pada elemen yang dipilih
  links_id.classList.add("active");

  // Main3 Section
  const tableContainer = document.createElement("div");
  tableContainer.style.margin = "12px 0 12px";

  // Menambahkan tabel dengan struktur HTML
  tableContainer.innerHTML = `
        <table>
        <thead>
            <tr>
            <th style="font-weight: 500; width: 5%">#</th>
            <th class="col-team" style="width: 40%; color: white">TEAM</th>
            <th class="col-p" style="width: 7.5%; color: white">P</th>
            <th class="col-w"style="width: 7.5%; color: white">W</th>
            <th class="col-d"style="width: 7.5%; color: white">D</th>
            <th class="col-l"style="width: 7.5%; color: white">L</th>
            <th class="col-f"style="width: 7.5%; color: white">F</th>
            <th class="col-a"style="width: 7.5%; color: white">A</th>
            <th class="col-gd"style="width: 7.5%; color: white">GD</th>
            <th class="col-pts"style="width: 7.5%; color: white">PTS</th>
            </tr>
        </thead>
        <tbody id="rankTable"></tbody>
        </table>
    `;

  // Menambahkan tableContainer ke dalam container utama
  container.appendChild(tableContainer);

  // Menyiapkan tbody untuk menambahkan data tim
  const rankTable = document.getElementById("rankTable");
  const tableRank = data;

  // Menggunakan loop untuk menambahkan data ke dalam table
  tableRank.forEach((team) => {
    // Membuat baris baru (tr) untuk setiap tim
    const row = document.createElement("tr");
    row.style.fontSize = "14px";

    // Menambahkan data ke dalam setiap sel (td)
    row.innerHTML = `
        <td style="font-weight: 500; width: 5%; color: white">${team.rank}</td>
       <td style="width: 40%; color: white">
                <img
                  loading="lazy"
                  src="${team.teamIMG}"
                  class="icon"
                  style="height: 30px; width: 30px"
                />
                ${team.teamNM}
              </td>
              <td style="width: 7.5%; color: white">${team.p}</td>
              <td style="width: 7.5%; color: white">${team.w}</td>
              <td style="width: 7.5%; color: white">${team.d}</td>
              <td style="width: 7.5%; color: white">${team.l}</td>
              <td style="width: 7.5%; color: white">${team.f}</td>
              <td style="width: 7.5%; color: white">${team.a}</td>
              <td style="width: 7.5%; color: white">${team.gd}</td>
              <td style="width: 7.5%; color: white">${team.pts}</td>
        `;

    // Menambahkan baris baru ke dalam tbody
    rankTable.appendChild(row);
  });
}

// JavaScript untuk memotong nama pemain jika terlalu panjang
document.querySelectorAll(".player-name").forEach((element) => {
  const fullName = element.getAttribute("data-name");
  const maxLength = 10; // Maksimal karakter yang diizinkan
  if (fullName.length > maxLength) {
    // Format nama: ambil nama depan dan inisial nama belakang
    const nameParts = fullName.split(" ");
    const formattedName =
      nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[1][0]}.` // Nama depan + inisial nama belakang
        : fullName.slice(0, maxLength - 1) + "."; // Jika hanya satu kata
    element.textContent = formattedName;
  } else {
    element.textContent = fullName;
  }
});

function createCoach(team1Data, team2Data) {
  const container = document.getElementById("dinamic-content");

  const subs_container = document.createElement("div");
  subs_container.classList.add("py-2");
  subs_container.innerHTML = `
      <span class="fw-10">COACHES</span>
    `;
  container.appendChild(subs_container);

  const subs_content = document.createElement("div");
  subs_content.classList.add("border", "rounded");

  for (let i = 0; i < team1Data["Pos"].length; i++) {
    if (team1Data["Pos"][i]["Pon"] == "COACH") {
      for (let j = 0; j < team2Data["Pos"].length; j++) {
        if (team2Data["Pos"][j]["Pon"] == "COACH") {
          const subElement = document.createElement("div");
          subElement.classList.add(
            "substitution",
            "d-flex",
            "justify-content-between",
            "align-items-center"
          );
          subElement.innerHTML = `
              <div class="subs">
                <span class="px-2">${team1Data["Pos"][i]["Fn"]} ${team1Data["Pos"][i]["Ln"]}</span>
              </div>

              <div class="subs">
                <span class="px-2">${team2Data["Pos"][j]["Fn"]} ${team2Data["Pos"][j]["Ln"]}</span>
              </div>
            `;
          subs_content.appendChild(subElement);
        }
      }
    }
  }

  // Tambahkan subs_content ke container jika ada isinya
  if (subs_content.children.length > 0) {
    subs_container.appendChild(subs_content);
  }
}

function createIS(team1Data, team2Data) {
  var len = team1Data.IS.length;
  const container = document.getElementById("dinamic-content");

  if (team1Data.IS.length < team2Data.IS.length) {
    len = team2Data.IS.length;
  }

  const subs_container = document.createElement("div");
  subs_container.classList.add("py-2");
  subs_container.innerHTML = `
      <span class="fw-10">INJURIES & SUSPENSIONS</span>
    `;
  container.appendChild(subs_container);

  const subs_content = document.createElement("div");
  subs_content.classList.add("border", "rounded");

  for (let i = 0; i < len; i += 1) {
    // Periksa apakah data untuk tim 1 dan tim 2 tersedia
    const team1Sub = team1Data.IS[i];
    const team2Sub = team2Data.IS[i];

    // Hanya tambahkan div jika ada data substitusi
    if (team1Sub || team2Sub) {
      console.log(team1Sub, team2Sub);
      const subElement = document.createElement("div");
      subElement.classList.add(
        "substitution",
        "d-flex",
        "justify-content-between",
        "align-items-center"
      );

      // Tambahkan konten tim 1 jika ada
      if (team1Sub) {
        subElement.innerHTML += `
          <div class="subs">
            <div>
              <div class="out"><b>${team1Sub.Fn} ${team1Sub.Ln}</b></div>
              <div class="in">${team1Sub.Rs}</div>
            </div>
          </div>
        `;
      } else {
        subElement.innerHTML += `
          <div class="subs">
            <div>
              <div class="out"><b></b></div>
              <div class="in"></div>
            </div>
          </div>
        `;
      }

      // Tambahkan konten tim 2 jika ada
      if (team2Sub) {
        subElement.innerHTML += `
          <div class="subs">
            <div>
              <div class="out"><b>${team2Sub.Fn} ${team2Sub.Ln}</b></div>
              <div class="in">${team2Sub.Rs}</div>
            </div>
          </div>
        `;
      } else {
        subElement.innerHTML += `
          <div class="subs">
            <div>
              <div class="out"><b></b></div>
              <div class="in"></div>
            </div>
          </div>
        `;
      }

      subs_content.appendChild(subElement);
    }
  }

  // Tambahkan subs_content ke container jika ada isinya
  if (subs_content.children.length > 0) {
    subs_container.appendChild(subs_content);
  }
}

function createSubsPlayer(team1Data, team2Data) {
  var len = team1Data.Pos.length;
  const container = document.getElementById("dinamic-content");

  if (team1Data.Pos.length < team2Data.Pos.length) {
    len = team2Data.Pos.length;
  }

  const subs_container = document.createElement("div");
  subs_container.classList.add("py-2");
  subs_container.innerHTML = `
      <span class="fw-10">SUBSTITUTE PLAYERS</span>
    `;
  container.appendChild(subs_container);

  const subs_content = document.createElement("div");
  subs_content.classList.add("border", "rounded");

  for (let i = 0; i < len; i += 1) {
    // Periksa apakah data untuk tim 1 dan tim 2 tersedia
    const team1Sub = team1Data.Pos[i];
    const team2Sub = team2Data.Pos[i];

    // Hanya tambahkan div jika ada data substitusi
    if (
      (team1Sub && team1Sub.Pon == "SUBSTITUTE_PLAYER") ||
      (team2Sub && team2Sub.Pon == "SUBSTITUTE_PLAYER")
    ) {
      const subElement = document.createElement("div");
      subElement.classList.add(
        "substitution",
        "d-flex",
        "justify-content-between",
        "align-items-center"
      );

      // Tambahkan konten tim 1 jika ada
      if (team1Sub) {
        subElement.innerHTML += `
          <div class="subs">
            <div class="subs-time border rounded-circle">${team1Sub.Np}</div>
            <div>
              <div>
                <span class="px-2">${team1Sub.Fn} ${team1Sub.Ln}</span>
              </div>
            </div>
          </div>
        `;
      }

      // Tambahkan konten tim 2 jika ada
      if (team2Sub) {
        subElement.innerHTML += `
          <div class="subs">
            <div class="subs-time border rounded-circle">${team1Sub.Np}</div>
            <div>
              <span class="px-2">${team2Sub.Fn} ${team2Sub.Ln}</span>
            </div>
          </div>
        `;
      }

      subs_content.appendChild(subElement);
    }
  }

  // Tambahkan subs_content ke container jika ada isinya
  if (subs_content.children.length > 0) {
    subs_container.appendChild(subs_content);
  }
}

function createSubs(team1Data, team2Data) {
  var len = team1Data.Subs.length;
  const container = document.getElementById("dinamic-content");

  if (team1Data.Subs.length < team2Data.Subs.length) {
    len = team2Data.Subs.length;
  }

  const subs_container = document.createElement("div");
  subs_container.classList.add("py-2");
  subs_container.innerHTML = `
      <span class="fw-10">SUBSTITUTION</span>
    `;
  container.appendChild(subs_container);

  const subs_content = document.createElement("div");
  subs_content.classList.add("border", "rounded");

  for (let i = 0; i < len; i += 2) {
    // Periksa apakah data untuk tim 1 dan tim 2 tersedia
    const team1Sub = team1Data.Subs[i];
    const team1SubNext = team1Data.Subs[i + 1];
    const team2Sub = team2Data.Subs[i];
    const team2SubNext = team2Data.Subs[i + 1];

    // Hanya tambahkan div jika ada data substitusi
    if (team1Sub || team2Sub) {
      const subElement = document.createElement("div");
      subElement.classList.add(
        "substitution",
        "d-flex",
        "justify-content-between",
        "align-items-center"
      );

      // Tambahkan konten tim 1 jika ada
      if (team1Sub) {
        subElement.innerHTML += `
          <div class="subs">
            <div class="subs-time">${team1Sub.Min}'</div>
            <div>
              <div class="out">
                <i class="fas fa-arrow-alt-circle-down text-danger"></i>
                ${team1Sub.Pn}
              </div>
              ${
                team1SubNext
                  ? `<div class="in">
                      <i class="fas fa-arrow-alt-circle-up text-warning"></i>
                      <b>${team1SubNext.Pn}</b>
                    </div>`
                  : ""
              }
            </div>
          </div>
        `;
      }

      // Tambahkan konten tim 2 jika ada
      if (team2Sub) {
        subElement.innerHTML += `
          <div class="subs">
            <div class="subs-time">${team2Sub.Min}'</div>
            <div>
              <div class="out">
                <i class="fas fa-arrow-alt-circle-down text-danger"></i>
                ${team2Sub.Pn}
              </div>
              ${
                team2SubNext
                  ? `<div class="in">
                      <i class="fas fa-arrow-alt-circle-up text-warning"></i>
                      <b>${team2SubNext.Pn}</b>
                    </div>`
                  : ""
              }
            </div>
          </div>
        `;
      }

      subs_content.appendChild(subElement);
    }
  }

  // Tambahkan subs_content ke container jika ada isinya
  if (subs_content.children.length > 0) {
    subs_container.appendChild(subs_content);
  }
}

// Fungsi untuk menambahkan elemen pemain
function createPlayerElements(teamData, positions, teamClass) {
  // Pilih elemen field-container
  const fieldContainer = document.querySelector(".field-container");
  const container = document.getElementById("dinamic-content");

  // Iterasi pemain
  teamData.Pos.forEach((player) => {
    if (player.Fp && player.Fp != "1:1") {
      // Split Fp untuk mendapatkan posisi x dan y
      const [xIndex, yIndex] = player.Fp.split(":").map(Number);

      // Ambil posisi pemain dari Fo
      const positionKey = teamData.Fo[xIndex - 2];
      const positionData = positions[positionKey];

      // Hitung posisi x dan y
      const x = positionData.x[yIndex - 1];
      const y = positions[xIndex]["y"];

      // Buat elemen pemain
      const playerDiv = document.createElement("div");
      playerDiv.className = `player ${teamClass}`;
      playerDiv.style.top = y;
      playerDiv.style.left = `${x}%`;
      playerDiv.textContent = player.Np; // Tambahkan posisi pemain (GOALKEEPER, DEFENDER, etc.)

      // Membuat elemen span untuk nama pemain
      const playerNameSpan = document.createElement("span");
      playerNameSpan.className = "player-name";
      const fullName = `${player.Fn} ${player.Ln}`;
      const maxLength = 10; // Maksimal karakter yang diizinkan
      playerNameSpan.textContent = fullName;
      if (fullName.length > maxLength) {
        // Format nama: ambil nama depan dan inisial nama belakang
        const nameParts = fullName.split(" ");
        const formattedName =
          nameParts.length > 1
            ? `${nameParts[0]} ${nameParts[1][0]}.` // Nama depan + inisial nama belakang
            : fullName.slice(0, maxLength - 1) + "."; // Jika hanya satu kata
        playerNameSpan.textContent = formattedName;
      }
      playerDiv.appendChild(playerNameSpan); // Menambahkan span ke dalam playerDiv

      // Tambahkan elemen ke container
      fieldContainer.appendChild(playerDiv);
    } else if (player.Fp && player.Fp == "1:1") {
      const playerDiv = document.createElement("div");
      playerDiv.className = `player ${teamClass}`;
      if (teamClass == "team1") {
        playerDiv.style.top = "5%";
      } else {
        playerDiv.style.top = "91%";
      }
      playerDiv.style.left = "47%";
      playerDiv.textContent = player.Np; // Tambahkan posisi pemain (GOALKEEPER, DEFENDER, etc.)

      // Membuat elemen span untuk nama pemain
      const playerNameSpan = document.createElement("span");
      playerNameSpan.className = "player-name";
      const fullName = `${player.Fn} ${player.Ln}`;
      const maxLength = 10; // Maksimal karakter yang diizinkan
      playerNameSpan.textContent = fullName;
      if (fullName.length > maxLength) {
        // Format nama: ambil nama depan dan inisial nama belakang
        const nameParts = fullName.split(" ");
        const formattedName =
          nameParts.length > 1
            ? `${nameParts[0]} ${nameParts[1][0]}.` // Nama depan + inisial nama belakang
            : fullName.slice(0, maxLength - 1) + "."; // Jika hanya satu kata
        playerNameSpan.textContent = formattedName;
      }
      playerDiv.appendChild(playerNameSpan); // Menambahkan span ke dalam playerDiv

      // Tambahkan elemen ke container
      fieldContainer.appendChild(playerDiv);
    } else {
      console.error("Nope");
    }
  });
  container.appendChild(fieldContainer);
}

function toggleStar(container) {
  container.classList.toggle("active"); // Tambah/hapus class aktif
}

async function reloadInitialView() {
  try {
    // Fungsi debounce
    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };
    // Melakukan permintaan ke API untuk data awal
    const response = await fetch("/api/search/", {
      method: "GET", // Atur metode (GET/POST, dsb.)
      headers: {
        "Content-Type": "application/json", // Tipe konten permintaan
      },
    });
    const data = await response.json();

    const leftBar = document.getElementById("leftSide");
    leftBar.innerHTML = ""; // Kosongkan konten sebelumnya

    // Membuat Search Bar
    const searchDiv = document.createElement("div");
    searchDiv.classList.add("mb-4");
    searchDiv.innerHTML = `
        <input
          type="text"
          class="form-control"
          placeholder="Search..."
          id="searchInput"
        />
      `;
    leftBar.appendChild(searchDiv);

    // Membuat Region Section
    const regionDiv = document.createElement("div");
    regionDiv.classList.add("mb-4");
    regionDiv.innerHTML = `<h6 class="text-uppercase">Region</h6>`;
    const regionList = document.createElement("ul");
    regionList.classList.add("list-unstyled");
    regionList.id = "region";

    data.data.categories.forEach((region) => {
      const li = document.createElement("li");
      li.classList.add("d-flex", "align-items-center", "mb-3", "p-2");
      li.id = "leftCard";
      li.setAttribute(
        "onclick",
        `detailCountry('${region.Ccd}', '${region.Cnm}')`
      );
      li.innerHTML = `
          <img
            src="${region.badgeUrl || "default-region.png"}"
            alt="${region.Ccd}"
            class="me-3"
            style="width: 20px; object-fit: cover"
          />
          <div class="d-flex flex-column">
            <span class="text-truncate">${region.Cnm}</span>
            <small class="text-light text-truncate"></small>
          </div>
        `;
      regionList.appendChild(li);
    });
    regionDiv.appendChild(regionList);
    leftBar.appendChild(regionDiv);

    // Membuat Teams Section
    const teamsDiv = document.createElement("div");
    teamsDiv.innerHTML = `<h6 class="text-uppercase">Teams</h6>`;
    const teamsList = document.createElement("ul");
    teamsList.classList.add("list-unstyled");
    teamsList.id = "teams";

    data.data.teams.forEach((team) => {
      const li = document.createElement("li");
      li.classList.add("d-flex", "align-items-center", "mb-3", "p-2");
      li.id = "leftCard";
      li.innerHTML = `
          <img
            src="${team.IMGTeam || "default-team.png"}"
            alt="${team.NMTeam}"
            class="me-3"
            style="width: 20px; object-fit: cover"
          />
          <div class="d-flex flex-column">
            <span class="text-truncate">${team.NMTeam}</span>
            <small class="text-light text-truncate">${team.CoNm}</small>
          </div>
        `;
      li.addEventListener("click", () => {
        window.location.href = `/team/${team.IDTeam}/`; // Gunakan data.url sebagai target URL
      });
      teamsList.appendChild(li);
    });
    teamsDiv.appendChild(teamsList);
    leftBar.appendChild(teamsDiv);

    // Membuat Competition Section
    const competitionDiv = document.createElement("div");
    competitionDiv.classList.add("mb-4");
    competitionDiv.innerHTML = `<h6 class="text-uppercase">Competition</h6>`;
    const competitionList = document.createElement("ul");
    competitionList.classList.add("list-unstyled");
    competitionList.id = "competition";

    data.data.stages.forEach((competition) => {
      const li = document.createElement("li");
      li.classList.add("d-flex", "align-items-center", "mb-3", "p-2");
      li.id = "leftCard";
      li.innerHTML = `
          <img
            src="${competition.badgeUrl || "default-competition.png"}"
            alt="${competition.Scd}"
            class="me-3"
            style="width: 20px; object-fit: cover"
          />
          <div class="d-flex flex-column">
            <span class="text-truncate">${competition.Snm}</span>
            <small class="text-light text-truncate">${competition.Cnm}</small>
          </div>
        `;
      li.addEventListener("click", () => {
        var modifiedString = competition.urlComp.replace(".", "/");
        window.location.href = `/comp/${modifiedString}/`; // Gunakan data.url sebagai target URL
      });
      competitionList.appendChild(li);
    });
    competitionDiv.appendChild(competitionList);
    leftBar.appendChild(competitionDiv);

    // Tambahkan event listener ke searchInput untuk live search
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener(
      "input",
      debounce(async (e) => {
        const query = e.target.value.trim(); // Dapatkan teks pencarian
        if (query) {
          await performSearch(query); // Panggil fungsi pencarian
        } else {
          reloadInitialView(); // Reset ke tampilan awal jika input kosong
        }
      }, 300) // Debounce selama 300ms
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Fungsi performSearch
const performSearch = async (query) => {
  try {
    const response = await fetch(`/api/search/${query}/`);
    const data = await response.json();

    const regionList = document.getElementById("region");
    const teamList = document.getElementById("teams");
    const compList = document.getElementById("competition");

    // Kosongkan daftar sebelumnya
    regionList.innerHTML = "";
    teamList.innerHTML = "";
    compList.innerHTML = "";

    // Tambahkan hasil pencarian
    populateList(regionList, data.data.categories, createRegionItem);
    populateList(teamList, data.data.teams, createTeamItem);
    populateList(compList, data.data.stages, createCompetitionItem);
  } catch (error) {
    console.error("Error in performSearch:", error);
  }
};

// Fungsi untuk mengisi daftar
const populateList = (list, data, createItem) => {
  if (data && data.length) {
    data.forEach((item) => list.appendChild(createItem(item)));
  } else {
    list.innerHTML = "<li class='text-muted'>No results found</li>";
  }
};

// Fungsi pembuat item untuk region, team, dan competition
const createRegionItem = (region) => {
  const li = document.createElement("li");
  li.classList.add("d-flex", "align-items-center", "mb-3", "p-2");
  li.id = "leftCard";
  li.setAttribute("onclick", `detailCountry('${region.Ccd}', '${region.Cnm}')`);
  li.innerHTML = `
      <img
        src="${region.badgeUrl || "default-region.png"}"
        alt="${region.Ccd}"
        class="me-3"
        style="width: 20px; object-fit: cover"
      />
      <div class="d-flex flex-column">
        <span class="text-truncate">${region.Cnm}</span>
      </div>
    `;
  return li;
};

const createTeamItem = (team) => {
  const li = document.createElement("li");
  li.classList.add("d-flex", "align-items-center", "mb-3", "p-2");
  li.id = "leftCard";
  li.innerHTML = `
      <img
        src="${team.IMGTeam || "default-team.png"}"
        alt="${team.NMTeam}"
        class="me-3"
        style="width: 20px; object-fit: cover"
      />
      <div class="d-flex flex-column">
        <span class="text-truncate">${team.NMTeam}</span>
        <small class="text-light text-truncate">${team.CoNm}</small>
      </div>
    `;
  li.addEventListener("click", () => {
    window.location.href = `/team/${team.IDTeam}/`; // Gunakan data.url sebagai target URL
  });
  return li;
};

const createCompetitionItem = (competition) => {
  const li = document.createElement("li");
  li.classList.add("d-flex", "align-items-center", "mb-3", "p-2");
  li.id = "leftCard";
  li.innerHTML = `
      <img
        src="${competition.badgeUrl || "default-competition.png"}"
        alt="${competition.Scd}"
        class="me-3"
        style="width: 20px; object-fit: cover"
      />
      <div class="d-flex flex-column">
        <span class="text-truncate">${competition.Snm}</span>
        <small class="text-light text-truncate">${competition.Cnm}</small>
      </div>
    `;
  li.addEventListener("click", () => {
    var modifiedString = competition.urlComp.replace(".", "/");
    window.location.href = `/comp/${modifiedString}/`; // Gunakan data.url sebagai target URL
  });
  return li;
};

async function detailCountry(country, title) {
  try {
    // Melakukan permintaan ke API
    const response = await fetch(`/api/football/detailCountry/${country}/`);
    const data = await response.json();

    const leftBar = document.getElementById("leftSide");
    leftBar.innerHTML = ""; // Kosongkan konten sebelumnya

    const countryData = data["data"];
    if (countryData && countryData.length > 0) {
      // Membuat elemen tombol kembali
      const div = document.createElement("div");
      div.classList.add("mb-4");
      div.innerHTML = `
          <button
            id="back-button"
            class="btn text-white d-flex align-items-center"
            onclick="reloadInitialView()"
          >
            <i class="fas fa-arrow-left"></i>
            <span id="header-title" class="ms-2">${title}</span>
          </button>`;
      leftBar.appendChild(div);

      // Membuat daftar kompetisi
      const ul = document.createElement("ul");
      ul.classList.add("list-unstyled");

      // Looping data kompetisi dan membuat elemen <li>
      countryData.forEach((datas) => {
        const li = document.createElement("li");
        li.classList.add("d-flex", "align-items-center", "mb-3", "p-2");
        li.id = "leftCard";

        li.innerHTML = `
            <img
              src="${datas.badgeUrl || "default-badge.png"}"
              alt="${datas.Scd}"
              class="me-3"
              style="width: 20px; object-fit: cover"
            />
            <div class="d-flex flex-column">
              <span>${datas.Snm}</span>
              <small class="text-light"></small>
            </div>
          `;
        li.addEventListener("click", () => {
          var modifiedString = datas.urlComp.replace(".", "/");
          window.location.href = `/comp/${modifiedString}/`; // Gunakan data.url sebagai target URL
        });
        ul.appendChild(li);
      });

      // Menambahkan daftar ke dalam `leftBar`
      leftBar.appendChild(ul);
    }
  } catch (error) {
    console.error("Error fetching country details:", error);
  }
}

const calendarBtn = document.getElementById("kt_datepicker_1");

// Inisialisasi Flatpickr
calendarBtn.flatpickr({
  dateFormat: "Ymd", // Format tanggal menjadi 20250107
  disableMobile: "true",
  onChange: function (selectedDates, dateStr, instance) {
    fetchSortedData(dateStr); // Cetak tanggal ke konsol
    generateCalendar(dateStr);
  },
});

let offset = 0;

function slideRight() {
  const slider = document.getElementById("slider");
  const itemWidth = slider.children[0].offsetWidth + 16; // Include margin
  offset -= itemWidth;

  // Check if last item is reached
  if (Math.abs(offset) >= slider.scrollWidth - slider.parentNode.offsetWidth) {
    offset = 0; // Reset to start
  }

  slider.style.transform = `translateX(${offset}px)`;
}

function slideLeft() {
  const slider = document.getElementById("slider");
  const itemWidth = slider.children[0].offsetWidth + 16; // Include margin
  offset += itemWidth;

  // Check if start is reached
  if (offset > 0) {
    offset = -(slider.scrollWidth - slider.parentNode.offsetWidth); // Go to the end
  }

  slider.style.transform = `translateX(${offset}px)`;
}

async function fetchSortedData(dateParam = null) {
  const uri = dateParam
    ? `/api/sorted_data/${dateParam}/` // Jika ada dateParam, tambahkan ke URL
    : "/api/sorted_data/"; // Jika tidak ada, panggil tanpa parameter

  const scrollableContainers = document.getElementsByClassName(
    "scrollable-container"
  );

  // Loop melalui semua elemen yang ditemukan dan kosongkan isinya
  Array.from(scrollableContainers).forEach((container) => {
    container.innerHTML = ""; // Kosongkan konten HTML dari elemen
  });
  try {
    // Mengirimkan permintaan ke URL yang sesuai
    const response = await fetch(uri, {
      method: "GET", // Atur metode (GET/POST, dsb.)
      headers: {
        "Content-Type": "application/json", // Tipe konten permintaan
      },
    });
    const sortedData = await response.json();

    const buttonContainerLive = document.getElementById("live");
    buttonContainerLive.innerHTML = "";

    const categoryDataLive = sortedData["live"];
    const showAllLive = document.getElementById("show-all-live");
    showAllLive.addEventListener("click", function () {
      showAll(categoryDataLive, "LIVE");
    });

    if (categoryDataLive && categoryDataLive.length > 0) {
      categoryDataLive.forEach((category, index) => {
        const button = document.createElement("button");
        button.classList.add("circle-button");

        // Jika data adalah elemen ke-0, tambahkan kelas 'active'
        if (index === 0) {
          button.classList.add("active");
          displayCategory(category, 0, category.urlComp);
        }

        button.innerHTML = `
              <div class="icon">
                  <img src="${category.badgeUrl || "default-icon.png"}" alt="${
          category.Scd
        }" />
              </div>
              <span>${category.Snm}</span>
          `;

        button.addEventListener("click", () => {
          // Hapus kelas 'active' dari semua tombol di container
          const buttons =
            buttonContainerLive.getElementsByClassName("circle-button");
          Array.from(buttons).forEach((btn) => btn.classList.remove("active"));

          // Tambahkan kelas 'active' pada tombol yang diklik
          button.classList.add("active");

          // Panggil fungsi untuk menampilkan data kategori
          displayCategory(category, 0, category.urlComp);
        });

        buttonContainerLive.appendChild(button);
      });
    }

    const buttonContainerNext = document.getElementById("next");
    buttonContainerNext.innerHTML = "";

    const categoryDataNext = sortedData["next"];
    const showAllNext = document.getElementById("show-all-upcoming");
    showAllNext.addEventListener("click", function () {
      showAll(categoryDataNext, "UPCOMING");
    });
    if (categoryDataNext && categoryDataNext.length > 0) {
      categoryDataNext.forEach((category, index) => {
        const button = document.createElement("button");
        button.classList.add("circle-button");

        // Jika data adalah elemen ke-0, tambahkan kelas 'active'
        if (index === 0) {
          button.classList.add("active");
          displayCategory(category, 1, category.urlComp);
        }

        button.innerHTML = `
              <div class="icon">
                  <img src="${category.badgeUrl || "default-icon.png"}" alt="${
          category.Scd
        }" />
              </div>
              <span>${category.Snm}</span>
          `;

        button.addEventListener("click", () => {
          // Hapus kelas 'active' dari semua tombol di container
          const buttons =
            buttonContainerNext.getElementsByClassName("circle-button");
          Array.from(buttons).forEach((btn) => btn.classList.remove("active"));

          // Tambahkan kelas 'active' pada tombol yang diklik
          button.classList.add("active");

          // Panggil fungsi untuk menampilkan data kategori
          displayCategory(category, 1, category.urlComp);
        });

        buttonContainerNext.appendChild(button);
      });
    }

    const buttonContainerPrevious = document.getElementById("previous");
    buttonContainerPrevious.innerHTML = "";

    const categoryDataPre = sortedData["previous"];
    const showAllPre = document.getElementById("show-all-previous");
    showAllPre.addEventListener("click", function () {
      showAll(categoryDataPre, "PREVIOUS");
    });
    if (categoryDataPre && categoryDataPre.length > 0) {
      categoryDataPre.forEach((category, index) => {
        const button = document.createElement("button");
        button.innerHTML = "";
        button.classList.add("circle-button");

        // Jika data adalah elemen ke-0, tambahkan kelas 'active'
        if (index === 0) {
          button.classList.add("active");
          displayCategory(category, 2, category.urlComp);
        }

        button.innerHTML = `
              <div class="icon">
                  <img src="${category.badgeUrl || "default-icon.png"}" alt="${
          category.Scd
        }" />
              </div>
              <span class="title">${category.Snm}</span>
          `;

        button.addEventListener("click", () => {
          // Hapus kelas 'active' dari semua tombol di container
          const buttons =
            buttonContainerPrevious.getElementsByClassName("circle-button");
          Array.from(buttons).forEach((btn) => btn.classList.remove("active"));

          // Tambahkan kelas 'active' pada tombol yang diklik
          button.classList.add("active");

          // Panggil fungsi untuk menampilkan data kategori
          displayCategory(category, 2, category.urlComp);
        });

        buttonContainerPrevious.appendChild(button);
      });
    }
    const buttonsNext = document.querySelectorAll(".button-container");

    buttonsNext.forEach((buttonNext) => {
      let isDragging = false;
      let startX, scrollLeft;

      buttonNext.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Mencegah blok teks
        isDragging = true;
        startX = e.pageX;
        scrollLeft = buttonNext.scrollLeft;
        document.body.style.cursor = "grabbing";
      });

      buttonNext.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Mencegah blok teks saat drag

        const moveX = e.pageX - startX;
        const newScrollLeft = scrollLeft - moveX;

        // Batasi gerakan scroll agar tidak overscroll
        if (newScrollLeft <= 0) {
          buttonNext.scrollLeft = 0; // Jangan geser lebih ke kiri dari 0
        } else if (
          newScrollLeft >=
          buttonNext.scrollWidth - buttonNext.clientWidth
        ) {
          buttonNext.scrollLeft =
            buttonNext.scrollWidth - buttonNext.clientWidth; // Jangan geser lebih ke kanan dari batas maksimum
        } else {
          buttonNext.scrollLeft = newScrollLeft;
        }
      });

      buttonNext.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.cursor = "default";
      });

      buttonNext.addEventListener("mouseleave", () => {
        isDragging = false;
        document.body.style.cursor = "default";
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function showAll(data, title) {
  // Ambil elemen utama
  const mainDiv = document.getElementById("main-div");
  const rightContent = document.getElementById("right-content");

  // Hapus konten dari elemen yang ada
  rightContent.innerHTML = ""; // Kosongkan elemen "right-content"
  mainDiv.innerHTML = ""; // Kosongkan elemen "main-div"

  // Reset class dari elemen utama dan tambahkan class baru
  mainDiv.className = "col-md-8"; // Langsung menetapkan class baru

  // Buat elemen konten utama
  const mainContent = document.createElement("div");
  mainContent.classList.add("p-3", "rounded", "shadow-sm", "text-light");

  mainContent.innerHTML = `
      <p>
        <a href="/" style="text-decoration: none;">
          <i class="fas fa-arrow-left" style="color: white;"></i>
        </a> 
        <b>${title}</b> MATCHES
      </p>
      <div class="button-container" id="button-container"></div>

      <div class="grid-container"></div>
    `;

  // Tambahkan elemen konten utama ke dalam elemen utama
  mainDiv.appendChild(mainContent);

  // Ambil elemen container tombol
  const buttonContainerLive = document.getElementById("button-container");

  if (data && data.length > 0) {
    data.forEach((datas, index) => {
      // Buat tombol untuk setiap item data
      const button = document.createElement("button");
      button.classList.add("circle-button");

      // Jika data adalah elemen ke-0, tambahkan kelas 'active' dan tampilkan kategori pertama
      if (index === 0) {
        button.classList.add("active");
        displayAll(datas, 0, datas.urlComp); // Pastikan fungsi ini ada dan berfungsi
      }

      // Isi tombol dengan data
      button.innerHTML = `
          <div class="icon">
            <img src="${datas.badgeUrl || "default-icon.png"}" alt="${
        datas.Scd
      }" />
          </div>
          <span>${datas.Snm}</span>
        `;

      // Tambahkan event listener untuk klik pada tombol
      button.addEventListener("click", () => {
        // Hapus kelas 'active' dari semua tombol di container
        const buttons =
          buttonContainerLive.getElementsByClassName("circle-button");
        Array.from(buttons).forEach((btn) => btn.classList.remove("active"));

        // Tambahkan kelas 'active' pada tombol yang diklik
        button.classList.add("active");

        // Panggil fungsi untuk menampilkan data kategori
        displayAll(datas, 0, datas.urlComp); // Pastikan fungsi ini ada
      });

      // Tambahkan tombol ke dalam container
      buttonContainerLive.appendChild(button);
    });
  } else {
    // Tampilkan pesan jika data kosong
    buttonContainerLive.innerHTML = `<p class="text-center text-muted">No matches available.</p>`;
  }
  const buttonsNext = document.querySelectorAll(".button-container");

  buttonsNext.forEach((buttonNext) => {
    let isDragging = false;
    let startX, scrollLeft;

    buttonNext.addEventListener("mousedown", (e) => {
      e.preventDefault(); // Mencegah blok teks
      isDragging = true;
      startX = e.pageX;
      scrollLeft = buttonNext.scrollLeft;
      document.body.style.cursor = "grabbing";
    });

    buttonNext.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault(); // Mencegah blok teks saat drag

      const moveX = e.pageX - startX;
      const newScrollLeft = scrollLeft - moveX;

      // Batasi gerakan scroll agar tidak overscroll
      if (newScrollLeft <= 0) {
        buttonNext.scrollLeft = 0; // Jangan geser lebih ke kiri dari 0
      } else if (
        newScrollLeft >=
        buttonNext.scrollWidth - buttonNext.clientWidth
      ) {
        buttonNext.scrollLeft = buttonNext.scrollWidth - buttonNext.clientWidth; // Jangan geser lebih ke kanan dari batas maksimum
      } else {
        buttonNext.scrollLeft = newScrollLeft;
      }
    });

    buttonNext.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.cursor = "default";
    });

    buttonNext.addEventListener("mouseleave", () => {
      isDragging = false;
      document.body.style.cursor = "default";
    });
  });
}

function displayAll(category, index, urlComp) {
  // Ambil elemen container tempat card akan ditempatkan
  const scrollableContainer =
    document.getElementsByClassName("grid-container")[index];
  scrollableContainer.innerHTML = ""; // Menghapus semua konten sebelumnya

  // Periksa jika ada events dalam kategori
  if (category && category.events && Array.isArray(category.events)) {
    category.events.forEach((data) => {
      // Buat card div
      const card = document.createElement("div");
      card.classList.add("card");

      let score1Html = "";
      let score2Html = "";
      // Cek apakah event.Score1 ada isinya
      if (
        data.Score1 !== null &&
        data.Score1 !== undefined &&
        data.Score1 !== ""
      ) {
        score1Html = `<div class="chelsea">${data.Score1}</div>`; // Tampilkan jika ada
      }

      // Cek apakah event.Score2 ada isinya
      if (
        data.Score2 !== null &&
        data.Score2 !== undefined &&
        data.Score2 !== ""
      ) {
        score2Html = `<div class="chelsea">${data.Score2}</div>`; // Tampilkan jika ada
      }

      card.innerHTML = `
              <div class="component-1">
                <div class="d-flex justify-content-between ms-3 me-3 py-3">
                  <div class="live-wrapper">
                      <b class="live">${data.Status_Match}</b>
                  </div>
                  <span class="team-score">
                    <div class="star-container" onclick="toggleStar(this)">
                      <img src="/static/img/star_border.png" class="star default" alt="Star Border">
                      <img src="/static/img/star.png" class="star filled" alt="Star Filled">
                    </div>
                  </span>
                </div>
                <div class="frame-group">
                  <div class="chelsea-fcsvg-parent">
                      <img class="chelsea-fcsvg-icon" alt="${
                        data.Team1.NMTeam
                      }" src="${data.Team1.IMGTeam}">
                      
                      <i class="vs">VS</i>
                      <img class="chelsea-fcsvg-icon" alt="${
                        data.Team2.NMTeam
                      }" src="${data.Team2.IMGTeam}">
                      
                  </div>
                  <div class="frame-container">
                      <div class="nd-round-parent">
                        <i class="nd-round"></i>
                        <i class="nd-round"></i>
                      </div>
                      <div class="spacing-line" ></div>
                  </div>
                  <div class="frame-div">
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${data.Team1.NMTeam}</div>
                        ${score1Html}
                    </div>
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${data.Team2.NMTeam}</div>
                        ${score2Html}
                    </div>
                    <img class="group-item" alt="" src="/static/img/Line 244.png">
                  </div>
                </div>
                <div class="button-primary">
                    <b class="button"><img alt="" src="/static/img/calendar_card.png"> ${formatTimestamp(
                      data.time_start
                    )}</b>
                </div>
              </div>
          `;
      // Tambahkan event listener untuk mengarahkan ke URL
      card.addEventListener("click", () => {
        window.location.href = `/match/${urlComp}/${data.IDMatch}`; // Gunakan data.url sebagai target URL
      });

      // Opsional: Tambahkan gaya kursor agar pengguna tahu card dapat diklik
      card.style.cursor = "pointer";

      // Menambahkan card ke dalam container
      scrollableContainer.appendChild(card);
    });
  } else {
    console.log("No events data available.");
  }
}

function displayCategory(category, index, urlComp) {
  // Ambil elemen container tempat card akan ditempatkan
  const scrollableContainer = document.getElementsByClassName(
    "scrollable-container"
  )[index];
  scrollableContainer.innerHTML = ""; // Menghapus semua konten sebelumnya

  // Periksa jika ada events dalam kategori
  if (category && category.events && Array.isArray(category.events)) {
    category.events.forEach((data) => {
      // Buat card div
      const card = document.createElement("div");
      card.classList.add("card");

      let score1Html = "";
      let score2Html = "";
      // Cek apakah event.Score1 ada isinya
      if (
        data.Score1 !== null &&
        data.Score1 !== undefined &&
        data.Score1 !== ""
      ) {
        score1Html = `<div class="chelsea">${data.Score1}</div>`; // Tampilkan jika ada
      }

      // Cek apakah event.Score2 ada isinya
      if (
        data.Score2 !== null &&
        data.Score2 !== undefined &&
        data.Score2 !== ""
      ) {
        score2Html = `<div class="chelsea">${data.Score2}</div>`; // Tampilkan jika ada
      }

      card.innerHTML = `
              <div class="component-1">
                <div class="d-flex justify-content-between ms-3 me-3 py-3">
                  <div class="live-wrapper">
                      <b class="live">${data.Status_Match}</b>
                  </div>
                  <span class="team-score">
                    <div class="star-container" onclick="toggleStar(this)">
                      <img src="/static/img/star_border.png" class="star default" alt="Star Border">
                      <img src="/static/img/star.png" class="star filled" alt="Star Filled">
                    </div>
                  </span>
                </div>
                <div class="frame-group">
                  <div class="chelsea-fcsvg-parent">
                    <div class="image-container">
                      <img src="${data.Team1.IMGTeam}" alt="${
        data.Team1.NMTeam
      }" />
                    </div>
                    <i class="vs">VS</i>
                    <div class="image-container">
                      <img src="${data.Team2.IMGTeam}" alt="${
        data.Team2.NMTeam
      }" />
                    </div>
                      
                  </div>
                  <div class="frame-container">
                      <div class="nd-round-parent">
                        <i class="nd-round"></i>
                        <i class="nd-round"></i>
                      </div>
                      <div class="spacing-line" ></div>
                  </div>
                  <div class="frame-div">
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${data.Team1.NMTeam}</div>
                        ${score1Html}
                    </div>
                    <div class="d-flex justify-content-between">
                        <div class="chelsea">${data.Team2.NMTeam}</div>
                        ${score2Html}
                    </div>
                    <img class="group-item" alt="" src="/static/img/Line 244.png">
                  </div>
                </div>
                <div class="button-primary">
                    <b class="button"><img alt="" src="/static/img/calendar_card.png"> ${formatTimestamp(
                      data.time_start
                    )}</b>
                </div>
              </div>
          `;

      // Tambahkan event listener untuk mengarahkan ke URL
      card.addEventListener("click", () => {
        window.location.href = `/match/${urlComp}/${data.IDMatch}`; // Gunakan data.url sebagai target URL
      });

      // Opsional: Tambahkan gaya kursor agar pengguna tahu card dapat diklik
      card.style.cursor = "pointer";

      // Menambahkan card ke dalam container
      scrollableContainer.appendChild(card);
    });
  } else {
    console.log("No events data available.");
  }
  const buttonNext = scrollableContainer; // Kontainer yang bisa di-scroll
  const prevBtn = document.querySelectorAll("#prevBtn")[index]; // Tombol geser kiri
  const nextBtn = document.querySelectorAll("#nextBtn")[index]; // Tombol geser kanan
  const scrollAmount = 100; // Jarak scroll setiap klik tombol

  let isDragging = false;
  let startX, scrollLeft;

  // Event saat mouse ditekan (mulai drag)
  buttonNext.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Mencegah blok teks
    isDragging = true;
    startX = e.pageX;
    scrollLeft = buttonNext.scrollLeft;
    document.body.style.cursor = "grabbing"; // Mengubah kursor saat dragging
  });

  // Event saat mouse digerakkan (drag)
  buttonNext.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Mencegah blok teks
    const moveX = e.pageX - startX; // Menghitung pergerakan horizontal mouse
    const newScrollLeft = scrollLeft - moveX;

    // Mencegah overscroll
    if (newScrollLeft <= 0) {
      buttonNext.scrollLeft = 0;
    } else if (
      newScrollLeft >=
      buttonNext.scrollWidth - buttonNext.clientWidth
    ) {
      buttonNext.scrollLeft = buttonNext.scrollWidth - buttonNext.clientWidth;
    } else {
      buttonNext.scrollLeft = newScrollLeft;
    }
  });

  // Event saat mouse dilepas (drag selesai)
  buttonNext.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.cursor = "default"; // Kembalikan kursor
  });

  // Event saat mouse keluar dari area scroll
  buttonNext.addEventListener("mouseleave", () => {
    isDragging = false;
    document.body.style.cursor = "default";
  });

  // Tombol geser kiri
  prevBtn.addEventListener("click", () => {
    buttonNext.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  // Tombol geser kanan
  nextBtn.addEventListener("click", () => {
    buttonNext.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
}

function convertYmdToDate(ymdString) {
  const year = parseInt(ymdString.substring(0, 4)); // Ambil 4 digit pertama untuk tahun
  const month = parseInt(ymdString.substring(4, 6)) - 1; // Ambil 2 digit berikutnya untuk bulan (0-based index)
  const day = parseInt(ymdString.substring(6, 8)); // Ambil 2 digit terakhir untuk hari

  return new Date(year, month, day); // Buat objek Date
}

function generateCalendar(dateParam = null) {
  const today = dateParam
    ? convertYmdToDate(dateParam) // Jika ada dateParam, gunakan fungsi untuk konversi
    : new Date(); // Jika tidak ada dateParam, gunakan tanggal hari ini
  const calendarGrid = document.getElementById("calendar-grid");
  calendarGrid.innerHTML = "";
  const calendarMonth = document.getElementById("calendar-month");

  // Set the month and year in the header
  const options = { month: "long", year: "numeric" };
  calendarMonth.textContent = today.toLocaleDateString("en-US", options);

  // Calculate dates
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i); // Shift the date by i days
    days.push(date);
  }

  // Create calendar cards
  days.forEach((date, index) => {
    const card = document.createElement("div");
    card.classList.add("calendar-card");
    const year = date.getFullYear(); // Tahun (YYYY)
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Bulan (MM) dengan dua digit
    const day = date.getDate().toString().padStart(2, "0"); // Hari (DD) dengan dua digit

    const formattedDate = `${year}${month}${day}`; // Format YYYYMMDD

    // Highlight the "today" card (3rd card, index 2)
    if (index === 3) {
      card.classList.add("active");
    }

    // Format the date
    const dayName = date
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase(); // e.g., "SUN"
    const dayNumber = date.getDate(); // e.g., "01"

    card.innerHTML = `
        <span>${dayName}</span>
        <span class="fw-normal">${dayNumber}</span>
      `;

    // Add click event listener to make it selectable
    card.addEventListener("click", () => {
      // Remove active class from all cards
      document
        .querySelectorAll(".calendar-card")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to the clicked card
      card.classList.add("active");
      fetchSortedData(formattedDate);

      // Display selected date in the console
      console.log(`Selected date: ${date.toDateString()}`);
    });

    // Append the card to the grid
    calendarGrid.appendChild(card);
  });
}

function formatTimestamp(timestamp) {
  // Memastikan bahwa timestamp adalah string
  let ts = timestamp.toString();

  // Mengambil bagian-bagian dari timestamp
  let year = ts.substring(0, 4); // Ambil tahun
  let month = ts.substring(4, 6); // Ambil bulan
  let day = ts.substring(6, 8); // Ambil hari
  let hour = ts.substring(8, 10); // Ambil jam
  let minute = ts.substring(10, 12); // Ambil menit

  // Array untuk nama bulan
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Menyusun string hasil format
  let formattedDate = `${day} ${
    months[parseInt(month) - 1]
  } ${year} - ${hour}.${minute}`;

  return formattedDate;
}
