const currentDate = document.getElementById("current-date");
const today = new Date();

currentDate.textContent = today.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});

const dashboardData = {
    todayRevenue: 1250.00,
    openOrders: 25,
    reservations: 12,
    freeTables: 6
};

function updateDashboard() {
    const revenueElement = document.getElementById("today-revenue");
    const ordersElement = document.getElementById("open-orders");
    const reservationsElement = document.getElementById("reservations");
    const tablesElement = document.getElementById("free-tables");

    revenueElement.textContent = dashboardData.todayRevenue.toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR"
    });

    ordersElement.textContent = dashboardData.openOrders;
    reservationsElement.textContent = dashboardData.reservations;
    tablesElement.textContent = dashboardData.freeTables;
}

updateDashboard();

const dishForm = document.getElementById("dish-form");
const dishNameInput = document.getElementById("dish-name");
const dishPriceInput = document.getElementById("dish-price");
const dishCategoryInput = document.getElementById("dish-category");
const dishList = document.getElementById("dish-list");
const dishSearchInput = document.getElementById("dish-search");
const categoryFilter = document.getElementById("category-filter");
const statusFilter = document.getElementById("status-filter");
const sortDishes = document.getElementById("sort-dishes");

let dishes = JSON.parse(localStorage.getItem("dishes")) || [];
let editingDishId = null;

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

    renderDishes();
    dishForm.reset();
});

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
}

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

function saveDishes() {
    localStorage.setItem("dishes", JSON.stringify(dishes));
}

renderDishes();