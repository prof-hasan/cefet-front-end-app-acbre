let db = null;

// Tenta carregar o Firebase
import('./firebase-config.js')
  .then(module => db = module.db)
  .catch(() => db = null);

async function loadRankingOnline() {
  if (!db) return null;

  try {
    const { collection, getDocs, orderBy, query } =
      await import("https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js");

    const q = query(
      collection(db, "ranking"),
      orderBy("score", "desc")
    );

    const snap = await getDocs(q);
    const list = [];

    snap.forEach(doc => {
      const data = doc.data();
      list.push({
        name: data.name,
        score: data.score,
        date: data.createdAt.toDate().toLocaleDateString("pt-BR")
      });
    });

    return list;

  } catch (err) {
    console.warn("Erro ao carregar ranking online:", err);
    return null;
  }
}

function loadRankingLocal() {
  const data = JSON.parse(localStorage.getItem("ranking") || "[]");
  return data.map(r => ({
    name: r.name,
    score: r.score,
    date: new Date(r.date).toLocaleDateString("pt-BR")
  }));
}

function preencherTabela(lista) {
  const tbody = document.getElementById("rank-body");
  tbody.innerHTML = "";

  lista.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.name}</td>
      <td>${item.score}</td>
      <td>${item.date}</td>
    `;
    tbody.appendChild(row);
  });
}

async function carregarRanking() {
  let lista = await loadRankingOnline();

  if (!lista) {
    console.warn("Usando ranking local");
    lista = loadRankingLocal();
  }

  lista.sort((a, b) => b.score - a.score);
  preencherTabela(lista);
}

document.getElementById('btn-voltar')
  .addEventListener('click', () => history.back());

carregarRanking();
