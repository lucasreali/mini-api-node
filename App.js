const express = require("express");
const { randomUUID } = require("crypto");
const fs = require("fs");

const app = express();
app.use(express.json());

let products = [];

const loadProducts = () => {
    try {
        const data = fs.readFileSync("products.json", "utf-8");
        products = JSON.parse(data || "[]");
    } catch (err) {
        console.log("Erro ao carregar produtos:", err);
        products = [];
    }
};

const saveProducts = () => {
    fs.writeFileSync("products.json", JSON.stringify(products, null, 2), (err) => {
        if (err) {
            console.log("Erro ao salvar produtos:", err);
        } else {
            console.log("Produtos salvos")
        }
    });
};

loadProducts();

app.post("/products", (req, res) => {
    const { name, price } = req.body;

    const product = {
        id: randomUUID(),
        name,
        price
    };

    loadProducts();
    products.push(product);
    saveProducts();

    return res.json(product);
});

app.get("/products", (req, res) => {
    loadProducts();
    return res.json(products);
});

app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    loadProducts();
    const product = products.find(product => product.id === id);
    if (!product) {
        return res.status(404).json({ message: "Produto não encontrado!" });
    }
    return res.json(product);
});

app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    loadProducts();
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) {
        return res.status(404).json({ message: "Produto não encontrado!" });
    }

    products[productIndex] = {
        ...products[productIndex],
        name,
        price
    };

    saveProducts();

    return res.json({ message: "Produto alterado com sucesso!" });
});

app.delete("/products/:id", (req, res) => {
    const { id } = req.params;

    const productIndex = products.findIndex(product => product.id === id);

    products.splice(productIndex, 1);
    saveProducts();

    return res.json({ message: "Produto removido com sucesso!" });
});

app.listen(4002, () => console.log("Servidor rodando na porta 4002"));
