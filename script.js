/* ============================================================
   CARRINHO (LOCALSTORAGE)
   ============================================================ */

// Carrega o carrinho do localStorage
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || [];
}

// Salva o carrinho
function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarDropdownCarrinho();
}

// Adicionar item ao carrinho
function addCarrinho(produto) {
  let carrinho = getCarrinho();

  let itemExistente = carrinho.find((item) => item.id === produto.id);

  if (itemExistente) {
    itemExistente.qtd++;
  } else {
    carrinho.push({ ...produto, qtd: 1 });
  }

  salvarCarrinho(carrinho);
}

/* ============================================================
   DROPDOWN DO HEADER
   ============================================================ */

function atualizarDropdownCarrinho() {
  const cardcar = document.getElementById("produto-cardcar");
  if (!cardcar) return;

  let carrinho = getCarrinho();

  if (carrinho.length === 0) {
    cardcar.innerHTML = "<p>Seu carrinho está vazio.</p>";
    return;
  }

  cardcar.innerHTML = carrinho
    .map(
      (produto, i) => `
      <div class="cart-item d-flex justify-content-between align-items-center">
        
        <img src="${produto.thumbnail}" style="width: 50px; height: 50px;">

        <div class="cart-item-details">
          <h6>${produto.title}</h6>
          <p>R$ ${produto.price}</p>
          
          <div class="d-flex align-items-center gap-2 mt-1">
            <button class="btn btn-sm btn-outline-secondary" onclick="dropdownAlterarQtd(${i}, -1)">-</button>
            <span class="fw-bold">${produto.qtd}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="dropdownAlterarQtd(${i}, 1)">+</button>
          </div>
        </div>

        <button class="btn btn-sm btn-danger" onclick="dropdownRemoverItem(${i})">X</button>

      </div>
    `
    )
    .join("");

  const total = carrinho.reduce((s, p) => s + p.price * p.qtd, 0);

  cardcar.innerHTML += `
    <div class="cart-total mt-3">
      <strong>Total: R$ ${total.toFixed(2)}</strong>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", atualizarDropdownCarrinho);

/* ============================================================
   HOME (LISTAGEM DE PRODUTOS)
   ============================================================ */

if (document.getElementById("produto-card")) {
  fetch("https://dummyjson.com/products")
    .then((res) => res.json())
    .then((data) => {
      const produtos = data.products;
      const card = document.getElementById("produto-card");

      card.innerHTML = `
        <div class="produtos-grid">
          ${produtos
            .map(
              (produto) => `
              <div class="produto-item">
                <a style="text-decoration: none;" href="produto.html?id=${
                  produto.id
                }">
                  <img src="${produto.thumbnail}">
                  <h2>${produto.title}</h2>
                  <p>${produto.description}</p>
                  <div class="price">R$ ${produto.price}</div>
                </a>

                <button class="btn-comprar" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                  Comprar
                </button>

                <button class="btn-carrinho btn-add-carrinho" 
                  data-produto='${JSON.stringify(produto)}'>
                  Adicionar ao Carrinho
                </button>
              </div>
            `
            )
            .join("")}
        </div>
      `;

      // Delegação de evento
      document
        .querySelector(".produtos-grid")
        .addEventListener("click", (e) => {
          const button = e.target.closest(".btn-add-carrinho");
          if (!button) return;

          const produto = JSON.parse(button.getAttribute("data-produto"));
          addCarrinho(produto);
        });
    });
}

/* ============================================================
   PÁGINA DO PRODUTO
   ============================================================ */

if (window.location.pathname.includes("produto.html")) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  fetch(`https://dummyjson.com/products/${id}`)
    .then((res) => res.json())
    .then((produto) => {
      const container = document.getElementById("produto-info");

      container.innerHTML = `
        <div class="produto-grid">

          <div class="produto-galeria">
            <img class="imagem-principal" src="${produto.thumbnail}">
            <div class="miniaturas">
              ${produto.images
                .map((img) => `<img src="${img}" class="miniatura">`)
                .join("")}
            </div>
          </div>

          <div class="produto-dados">
            <h1>${produto.title}</h1>
            <div class="estrelas">⭐ ${produto.rating}</div>
            <div class="produto-preco">R$ ${produto.price}</div>

            <button class="btn-add">Adicionar ao Carrinho</button>
            <button class="btn-comp" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
              Comprar
            </button>

            <div class="descricao-box">
              <h3>Descrição do Produto</h3>
              <p>${produto.description}</p>
            </div>
          </div>

        </div>
      `;

      // Miniaturas trocam imagem principal
      document.querySelectorAll(".miniatura").forEach((m) => {
        m.addEventListener("click", () => {
          document.querySelector(".imagem-principal").src = m.src;
        });
      });

      document.querySelector(".btn-add").addEventListener("click", () => {
        addCarrinho(produto);
      });
    });
}

/* ============================================================
   QR CODE (MANTENHO O SEU CÓDIGO)
   ============================================================ */

const qrcodeImg = document.getElementById("qrcode");

async function gerarQRCode() {
  const texto = "https://getbootstrap.com.br/docs/4.1/components/modal/";
  const apiURL = "https://api.qrserver.com/v1/create-qr-code/";

  const params = new URLSearchParams({
    data: texto,
    size: "200x200",
    margin: 10,
    bgcolor: "ffffff",
    color: "000000",
    ecc: "H",
  });

  try {
    const response = await fetch(`${apiURL}?${params.toString()}`);
    const blob = await response.blob();
    qrcodeImg.src = URL.createObjectURL(blob);
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
  }
}
gerarQRCode();

// Mostrar dropdown ao passar o mouse (desktop) — mantém click em mobile
(function enableDropdownHover() {
  // só ativa hover em telas grandes (evita conflito em mobile)
  function isDesktop() {
    return window.matchMedia && window.matchMedia("(min-width: 768px)").matches;
  }

  function attach() {
    document
      .querySelectorAll("[data-bs-toggle='dropdown']")
      .forEach((toggle) => {
        // garante instancia do bootstrap
        const bsDropdown = new bootstrap.Dropdown(toggle, { autoClose: false });

        const parent = toggle.parentElement;
        if (!parent) return;

        // show/hide no hover
        parent.addEventListener("mouseenter", () => {
          if (!isDesktop()) return;
          bsDropdown.show();
        });
        parent.addEventListener("mouseleave", () => {
          if (!isDesktop()) return;
          bsDropdown.hide();
        });

        // em touch/click padrão do Bootstrap continua funcionando
      });
  }

  // rodar agora e também ao redimensionar (para aplicar/desaplicar)
  document.addEventListener("DOMContentLoaded", attach);
  window.addEventListener("resize", attach);
})();

function dropdownAlterarQtd(index, valor) {
  let carrinho = getCarrinho();

  carrinho[index].qtd += valor;

  if (carrinho[index].qtd <= 0) {
    carrinho.splice(index, 1);
  }

  salvarCarrinho(carrinho);

  // Atualiza página do carrinho se estiver aberta
  if (typeof atualizarCarrinhoPagina === "function") {
    atualizarCarrinhoPagina();
  }
}

function dropdownRemoverItem(index) {
  let carrinho = getCarrinho();
  carrinho.splice(index, 1);
  salvarCarrinho(carrinho);

  // Atualiza página do carrinho se estiver aberta
  if (typeof atualizarCarrinhoPagina === "function") {
    atualizarCarrinhoPagina();
  }
}

/* ============================================================
   MAPA LEAFLET — PORTO ALEGRE + GEOLOCALIZAÇÃO DO USUÁRIO
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const mapaDiv = document.getElementById("mapa");
  if (!mapaDiv) return; // só cria em páginas que possuem o mapa

  // Coordenadas de Porto Alegre
  const portoAlegre = [-30.0346, -51.2177];

  // Criar o mapa centralizado em Porto Alegre
  const map = L.map("mapa").setView(portoAlegre, 13);

  // Camada do mapa (tile layer)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Marcador de Porto Alegre
  L.marker(portoAlegre)
    .addTo(map)
    .bindPopup("📍 Porto Alegre — RS")
    .openPopup();

  /* ============================================================
     OPÇÃO: Mostrar localização atual do usuário
     ============================================================ */
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        const userMarker = L.marker([userLat, userLng], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [32, 32],
          }),
        })
          .addTo(map)
          .bindPopup("📍 Você está aqui!");

        // Ajusta o mapa para mostrar POA + usuário
        const group = L.featureGroup([userMarker, L.marker(portoAlegre)]);

        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      },
      function (err) {
        console.warn("Geolocalização negada pelo usuário.");
      }
    );
  }
});
