// ======================================================
// Datum
// ======================================================

const currentDate = document.getElementById("current-date");
const today = new Date();

currentDate.textContent = today.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});


// ======================================================
// DOM-Elemente
// ======================================================

const dishForm = document.getElementById("dish-form");
const dishNameInput = document.getElementById("dish-name");
const dishPriceInput = document.getElementById("dish-price");
const dishCategoryInput = document.getElementById("dish-category");

const dishList = document.getElementById("dish-list");

const dishSearchInput = document.getElementById("dish-search");
const categoryFilter = document.getElementById("category-filter");
const statusFilter = document.getElementById("status-filter");
const sortDishes = document.getElementById("sort-dishes");


// ======================================================
// Daten
// ======================================================

let dishes = JSON.parse(localStorage.getItem("dishes")) || [];
let editingDishId = null;


// ======================================================
// Dashboard
// ======================================================

function updateDashboard() {
    const totalDishesElement = document.getElementById("total-dishes");
    const availableDishesElement = document.getElementById("available-dishes");
    const soldOutDishesElement = document.getElementById("sold-out-dishes");
    const averagePriceElement = document.getElementById("average-price");

    const totalDishes = dishes.length;

    const availableDishes = dishes.filter(function (dish) {
        return dish.available;
    }).length;

    const soldOutDishes = dishes.filter(function (dish) {
        return !dish.available;
    }).length;

    let averagePrice = 0;

    if (dishes.length > 0) {
        const totalPrice = dishes.reduce(function (sum, dish) {
            return sum + dish.price;
        }, 0);

        averagePrice = totalPrice / dishes.length;
    }

    totalDishesElement.textContent = totalDishes;
    availableDishesElement.textContent = availableDishes;
    soldOutDishesElement.textContent = soldOutDishes;

    averagePriceElement.textContent = averagePrice.toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR"
    });
}


// ======================================================
// Formular: Gericht hinzufügen / bearbeiten
// ======================================================

dishForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (editingDishId !== null) {
        const dish = dishes.find(function (dish) {
            return dish.id === editingDishId;
        });

        if (dish) {
            dish.name = dishNameInput.value;
            dish.price = Number(dishPriceInput.value);
            dish.category = dishCategoryInput.value;

            saveDishes();
        }

        editingDishId = null;

        const submitButton = dishForm.querySelector('button[type="submit"]');
        submitButton.textContent = "Gericht hinzufügen";

    } else {
        const newDish = {
            id: Date.now(),
            name: dishNameInput.value,
            price: Number(dishPriceInput.value),
            category: dishCategoryInput.value,
            available: true
        };

        dishes.push(newDish);

        saveDishes();
    }

    dishForm.reset();

    renderDishes();
});


// ======================================================
// Speisekarte rendern
// ======================================================

function renderDishes() {
    dishList.innerHTML = "";

    const searchTerm = dishSearchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;
    const selectedSort = sortDishes.value;

    let filteredDishes = dishes.filter(function (dish) {
        const matchesSearch = dish.name
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            selectedCategory === "Alle" ||
            dish.category === selectedCategory;

        const matchesStatus =
            selectedStatus === "Alle" ||
            (selectedStatus === "Verfügbar" && dish.available) ||
            (selectedStatus === "Ausverkauft" && !dish.available);

        return matchesSearch && matchesCategory && matchesStatus;
    });


    // --------------------------------------------------
    // Sortierung
    // --------------------------------------------------

    filteredDishes.sort(function (a, b) {
        if (selectedSort === "name-asc") {
            return a.name.localeCompare(b.name, "de");
        }

        if (selectedSort === "name-desc") {
            return b.name.localeCompare(a.name, "de");
        }

        if (selectedSort === "price-asc") {
            return a.price - b.price;
        }

        if (selectedSort === "price-desc") {
            return b.price - a.price;
        }

        return 0;
    });


    // --------------------------------------------------
    // Gerichtskarten erstellen
    // --------------------------------------------------

    filteredDishes.forEach(function (dish) {
        const dishCard = document.createElement("div");

        dishCard.classList.add("dish-card");

        dishCard.innerHTML = `
            <div>
                <h3>${dish.name}</h3>

                <p>${dish.category}</p>

                <span class="dish-status ${dish.available ? "available" : "sold-out"}">
                    ${dish.available ? "Verfügbar" : "Ausverkauft"}
                </span>
            </div>

            <div class="dish-actions">

                <strong>
                    ${dish.price.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR"
                    })}
                </strong>

                <button
                    type="button"
                    class="status-button"
                    data-id="${dish.id}"
                >
                    ${dish.available ? "Ausverkauft" : "Verfügbar"}
                </button>

                <button
                    type="button"
                    class="edit-button"
                    data-id="${dish.id}"
                >
                    Bearbeiten
                </button>

                <button
                    type="button"
                    class="delete-button"
                    data-id="${dish.id}"
                >
                    Löschen
                </button>

            </div>
        `;

        dishList.appendChild(dishCard);
    });

    updateDashboard();
}


// ======================================================
// Buttons in der Gerichtsliste
// ======================================================

dishList.addEventListener("click", function (event) {
    const button = event.target;

    if (button.classList.contains("delete-button")) {
        const id = Number(button.dataset.id);

        deleteDish(id);
    }

    if (button.classList.contains("status-button")) {
        const id = Number(button.dataset.id);

        toggleDishAvailability(id);
    }

    if (button.classList.contains("edit-button")) {
        const id = Number(button.dataset.id);

        editDish(id);
    }
});


// ======================================================
// Suche und Filter
// ======================================================

dishSearchInput.addEventListener("input", function () {
    renderDishes();
});

categoryFilter.addEventListener("change", function () {
    renderDishes();
});

statusFilter.addEventListener("change", function () {
    renderDishes();
});

sortDishes.addEventListener("change", function () {
    renderDishes();
});


// ======================================================
// Gericht löschen
// ======================================================

function deleteDish(id) {
    const dishIndex = dishes.findIndex(function (dish) {
        return dish.id === id;
    });

    if (dishIndex !== -1) {
        dishes.splice(dishIndex, 1);

        saveDishes();
    }

    renderDishes();
}


// ======================================================
// Verfügbarkeit ändern
// ======================================================

function toggleDishAvailability(id) {
    const dish = dishes.find(function (dish) {
        return dish.id === id;
    });

    if (dish) {
        dish.available = !dish.available;

        saveDishes();
    }

    renderDishes();
}


// ======================================================
// Gericht bearbeiten
// ======================================================

function editDish(id) {
    const dish = dishes.find(function (dish) {
        return dish.id === id;
    });

    if (!dish) {
        return;
    }

    dishNameInput.value = dish.name;
    dishPriceInput.value = dish.price;
    dishCategoryInput.value = dish.category;

    editingDishId = dish.id;

    const submitButton = dishForm.querySelector('button[type="submit"]');

    submitButton.textContent = "Änderungen speichern";
}


// ======================================================
// LocalStorage
// ======================================================

function saveDishes() {
    localStorage.setItem("dishes", JSON.stringify(dishes));
}


// ======================================================
// Initialer Start
// ======================================================

renderDishes();