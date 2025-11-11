fetch("https://dummyjson.com/carts")
  .then((res) => res.json())
  .then(console.log);

// Array para armazenar os itens do carrinho
let carrinhoItens = [];

// Função global para adicionar ao carrinho
function addcarrinho(produto) {
  carrinhoItens.push(produto);
  atualizarCarrinho();
}

// Função para atualizar a exibição do carrinho
function atualizarCarrinho() {
  const cardcar = document.getElementById("produto-cardcar");
  cardcar.innerHTML = carrinhoItens
    .map(
      (produto) => `
    <div class="cart-item">
      <img src="${produto.thumbnail}" alt="${produto.title}" style="width: 50px; height: 50px;">
      <div class="cart-item-details">
        <h6>${produto.title}</h6>
        <p>R$ ${produto.price}</p>
      </div>
    </div>
  `
    )
    .join("");

  // Adiciona o total do carrinho
  if (carrinhoItens.length > 0) {
    const total = carrinhoItens.reduce((sum, item) => sum + item.price, 0);
    cardcar.innerHTML += `
      <div class="cart-total">
        <strong>Total: R$ ${total.toFixed(2)}</strong>
      </div>
    `;
  }
}

// busca dados da api
fetch("https://dummyjson.com/products")
  .then((res) => res.json())
  .then((data) => {
    const produtos = data.products;
    // Montar todos os cards
    const card = document.getElementById("produto-card");
    card.innerHTML = `
      <div class="produtos-grid">
        ${produtos
          .slice(0, 6)
          .map(
            (produto) => `
          <div class="produto-item">
            <img src="${produto.thumbnail}" alt="${produto.title}">
            <h2>${produto.title}</h2>
            <p>${produto.description}</p>
            <div class="price">Preço: R$ ${produto.price}</div>
            <div class="rating">Avalição: ${produto.rating}</div>
            <button class="btn-comprar "
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop">Comprar</button>
            <button class="btn-carrinho  btn-add-carrinho" 
              data-produto="${encodeURIComponent(JSON.stringify(produto))}">
              Adicionar ao Carrinho
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Usar event delegation no container para garantir que cliques em
    // elementos filhos sejam capturados e para suportar conteúdo dinâmico
    const produtosContainer = document.querySelector(".produtos-grid");
    if (produtosContainer) {
      produtosContainer.addEventListener("click", (e) => {
        const button = e.target.closest(".btn-add-carrinho");
        if (!button || !produtosContainer.contains(button)) return;
        const raw = button.getAttribute("data-produto");
        if (!raw) {
          console.warn("Botão sem atributo data-produto detectado:", button);
          return;
        }
        // logs de depuração para os casos que falham
        console.debug("Clique detectado no botão add-carrinho", {
          button,
          rawLength: raw.length,
          rawPreview: raw.slice(0, 120),
        });
        try {
          const produto = JSON.parse(decodeURIComponent(raw));
          console.info("Adicionando ao carrinho:", produto.title);
          addcarrinho(produto);
        } catch (err) {
          console.error("Erro ao parsear produto do botão:", err, raw);
        }
      });
    }
  })

  .catch((error) => {
    console.error("Erro ao carregar produto", error);
    document.getElementById("produto-card").innerHTML =
      "<p>Error ao carregar produto</p>";
  });

// carrega qrcode de api externa
const img = document.getElementById("qrcode");

// funcao geradora
async function gerarQRCode() {
  const texto = "https://getbootstrap.com.br/docs/4.1/components/modal/";
  if (texto === "") {
    alert("Por favor, digite um texto ou link");
    return;
  }
  /****************************************
   * data -> recebe texto
   * size -> tamanho imagem
   * bgcolor -> fundo
   * ecc -> L,M,Q,H
   * margin -> pixel
   * color -> codigo
   * format -> png, svg, eps, gif
   *****************************************/
  // define as configuracoes do qrcode
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
    // conexao api
    const response = await fetch(`${apiURL}?${params.toString()}`);
    //if(!response.ok) throw new Error("Erro ao gerar o qrcode");
    // salva o qrcode gerado e exibe no docunto
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    img.src = imageUrl;
  } catch (error) {
    console.error(error);
    alert("Não foi possível gerar o Qr code");
  }
}
gerarQRCode();
