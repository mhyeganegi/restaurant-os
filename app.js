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

// ------------------------------------------------------
// Navigation
// ------------------------------------------------------

const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

const pageTitle = document.getElementById("page-title");
const newOrderButton = document.getElementById("new-order-button");


// ------------------------------------------------------
// Speisekarte
// ------------------------------------------------------

const dishForm = document.getElementById("dish-form");

const dishNameInput = document.getElementById("dish-name");
const dishPriceInput = document.getElementById("dish-price");
const dishCategoryInput = document.getElementById("dish-category");

const dishList = document.getElementById("dish-list");

const dishSearchInput = document.getElementById("dish-search");
const categoryFilter = document.getElementById("category-filter");
const statusFilter = document.getElementById("status-filter");
const sortDishes = document.getElementById("sort-dishes");


// ------------------------------------------------------
// Bestellungen
// ------------------------------------------------------

const orderForm = document.getElementById("order-form");

const orderTableInput = document.getElementById("order-table");
const orderDishSelect = document.getElementById("order-dish");
const orderQuantityInput = document.getElementById("order-quantity");

const orderList = document.getElementById("order-list");


// ------------------------------------------------------
// Bezahlung
// ------------------------------------------------------

const paymentPanel = document.getElementById("payment-panel");

const paymentTable = document.getElementById("payment-table");
const paymentSubtotal = document.getElementById("payment-subtotal");

const paymentMethod = document.getElementById("payment-method");

const tipSelect = document.getElementById("tip-select");
const customTipGroup = document.getElementById("custom-tip-group");
const customTipInput = document.getElementById("custom-tip");

const paymentTip = document.getElementById("payment-tip");
const paymentTotal = document.getElementById("payment-total");

const closePaymentButton = document.getElementById(
    "close-payment-button"
);

const confirmPaymentButton = document.getElementById(
    "confirm-payment-button"
);


// ------------------------------------------------------
// Reservierungen
// ------------------------------------------------------

const reservationForm = document.getElementById("reservation-form");

const reservationNameInput = document.getElementById(
    "reservation-name"
);

const reservationPhoneInput = document.getElementById(
    "reservation-phone"
);

const reservationDateInput = document.getElementById(
    "reservation-date"
);

const reservationTimeInput = document.getElementById(
    "reservation-time"
);

const reservationGuestsInput = document.getElementById(
    "reservation-guests"
);

const reservationList = document.getElementById(
    "reservation-list"
);


// ------------------------------------------------------
// Tische
// ------------------------------------------------------

const tableList = document.getElementById("table-list");


// ======================================================
// Daten
// ======================================================

let dishes =
    JSON.parse(localStorage.getItem("dishes")) || [];

let orders =
    JSON.parse(localStorage.getItem("orders")) || [];

let reservations =
    JSON.parse(localStorage.getItem("reservations")) || [];

let tables =
    JSON.parse(localStorage.getItem("tables")) || [];


// ------------------------------------------------------
// Alte Bestelldaten kompatibel machen
// ------------------------------------------------------

orders = orders.map(function (order) {
    const subtotal =
        Number(order.price || 0) *
        Number(order.quantity || 0);

    return {
        ...order,

        tip: Number(order.tip ?? 0),

        totalPaid:
            order.totalPaid !== undefined &&
            order.totalPaid !== null
                ? Number(order.totalPaid)
                : order.status === "Bezahlt"
                    ? subtotal
                    : null,

        paymentMethod:
            order.paymentMethod ?? ""
    };
});


// ------------------------------------------------------
// Alte Reservierungsdaten kompatibel machen
// ------------------------------------------------------

reservations = reservations.map(function (reservation) {
    return {
        ...reservation,
        tableId: reservation.tableId ?? null
    };
});


// ------------------------------------------------------
// Aktueller UI-Zustand
// ------------------------------------------------------

let editingDishId = null;
let payingOrderId = null;


// ======================================================
// Standard-Tische
// ======================================================

if (tables.length === 0) {
    tables = [
        {
            id: 1,
            number: 1,
            seats: 2,
            status: "Frei"
        },
        {
            id: 2,
            number: 2,
            seats: 4,
            status: "Frei"
        },
        {
            id: 3,
            number: 3,
            seats: 4,
            status: "Frei"
        },
        {
            id: 4,
            number: 4,
            seats: 6,
            status: "Frei"
        }
    ];

    saveTables();
}


// ======================================================
// Hilfsfunktionen
// ======================================================

function formatCurrency(value) {
    return Number(value).toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR"
    });
}


function getOrderSubtotal(order) {
    return Number(order.price) * Number(order.quantity);
}


// ======================================================
// Dashboard
// ======================================================

function updateDashboard() {
    const totalDishesElement =
        document.getElementById("total-dishes");

    const availableDishesElement =
        document.getElementById("available-dishes");

    const soldOutDishesElement =
        document.getElementById("sold-out-dishes");

    const averagePriceElement =
        document.getElementById("average-price");


    const totalDishes = dishes.length;


    const availableDishes = dishes.filter(function (dish) {
        return dish.available;
    }).length;


    const soldOutDishes = dishes.filter(function (dish) {
        return !dish.available;
    }).length;


    let averagePrice = 0;

    if (dishes.length > 0) {
        const totalPrice = dishes.reduce(
            function (sum, dish) {
                return sum + Number(dish.price);
            },
            0
        );

        averagePrice = totalPrice / dishes.length;
    }


    totalDishesElement.textContent = totalDishes;

    availableDishesElement.textContent =
        availableDishes;

    soldOutDishesElement.textContent =
        soldOutDishes;

    averagePriceElement.textContent =
        formatCurrency(averagePrice);
}


// ======================================================
// Navigation zwischen den Views
// ======================================================

navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const targetViewId = link.dataset.view;

        showView(targetViewId, link);
    });
});


function showView(targetViewId, activeLink = null) {
    views.forEach(function (view) {
        view.classList.add("hidden");
    });


    navLinks.forEach(function (navLink) {
        navLink.classList.remove("active");
    });


    const targetView =
        document.getElementById(targetViewId);

    if (!targetView) {
        return;
    }


    targetView.classList.remove("hidden");


    if (activeLink) {
        activeLink.classList.add("active");

        pageTitle.textContent =
            activeLink.textContent.trim();
    }
}


// ======================================================
// Dashboard: Neue Bestellung öffnen
// ======================================================

newOrderButton.addEventListener("click", function () {
    const ordersLink = document.querySelector(
        '.nav-link[data-view="orders-view"]'
    );


    showView("orders-view", ordersLink);


    orderTableInput.focus();
});


// ======================================================
// Gericht hinzufügen / bearbeiten
// ======================================================

dishForm.addEventListener("submit", function (event) {
    event.preventDefault();


    const name = dishNameInput.value.trim();

    const price =
        Number(dishPriceInput.value);

    const category =
        dishCategoryInput.value;


    if (
        name === "" ||
        price < 0 ||
        category === ""
    ) {
        return;
    }


    // --------------------------------------------------
    // Bestehendes Gericht bearbeiten
    // --------------------------------------------------

    if (editingDishId !== null) {
        const dish = dishes.find(function (dish) {
            return dish.id === editingDishId;
        });


        if (dish) {
            dish.name = name;
            dish.price = price;
            dish.category = category;

            saveDishes();
        }


        editingDishId = null;


        const submitButton =
            dishForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.textContent =
            "Gericht hinzufügen";
    }

    // --------------------------------------------------
    // Neues Gericht
    // --------------------------------------------------

    else {
        const newDish = {
            id: Date.now(),
            name: name,
            price: price,
            category: category,
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


    const searchTerm =
        dishSearchInput.value
            .trim()
            .toLowerCase();


    const selectedCategory =
        categoryFilter.value;

    const selectedStatus =
        statusFilter.value;

    const selectedSort =
        sortDishes.value;


    // --------------------------------------------------
    // Filtern
    // --------------------------------------------------

    const filteredDishes = dishes.filter(
        function (dish) {
            const matchesSearch =
                dish.name
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesCategory =
                selectedCategory === "Alle" ||
                dish.category === selectedCategory;


            const matchesStatus =
                selectedStatus === "Alle" ||

                (
                    selectedStatus === "Verfügbar" &&
                    dish.available
                ) ||

                (
                    selectedStatus === "Ausverkauft" &&
                    !dish.available
                );


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        }
    );


    // --------------------------------------------------
    // Sortieren
    // --------------------------------------------------

    filteredDishes.sort(function (a, b) {
        if (selectedSort === "name-asc") {
            return a.name.localeCompare(
                b.name,
                "de"
            );
        }


        if (selectedSort === "name-desc") {
            return b.name.localeCompare(
                a.name,
                "de"
            );
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
    // Gerichtskarten
    // --------------------------------------------------

    filteredDishes.forEach(function (dish) {
        const dishCard =
            document.createElement("div");


        dishCard.classList.add("dish-card");


        dishCard.innerHTML = `
            <div>

                <h3>${dish.name}</h3>

                <p>${dish.category}</p>

                <span
                    class="dish-status ${
                        dish.available
                            ? "available"
                            : "sold-out"
                    }"
                >
                    ${
                        dish.available
                            ? "Verfügbar"
                            : "Ausverkauft"
                    }
                </span>

            </div>


            <div class="dish-actions">

                <strong>
                    ${formatCurrency(dish.price)}
                </strong>


                <button
                    type="button"
                    class="status-button"
                    data-id="${dish.id}"
                >
                    ${
                        dish.available
                            ? "Ausverkauft"
                            : "Verfügbar"
                    }
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

    updateOrderDishOptions();
}


// ======================================================
// Buttons in der Gerichtsliste
// ======================================================

dishList.addEventListener("click", function (event) {
    const button = event.target;


    if (
        button.classList.contains(
            "delete-button"
        )
    ) {
        const id =
            Number(button.dataset.id);

        deleteDish(id);
    }


    if (
        button.classList.contains(
            "status-button"
        )
    ) {
        const id =
            Number(button.dataset.id);

        toggleDishAvailability(id);
    }


    if (
        button.classList.contains(
            "edit-button"
        )
    ) {
        const id =
            Number(button.dataset.id);

        editDish(id);
    }
});


// ======================================================
// Suche und Filter
// ======================================================

dishSearchInput.addEventListener(
    "input",
    function () {
        renderDishes();
    }
);


categoryFilter.addEventListener(
    "change",
    function () {
        renderDishes();
    }
);


statusFilter.addEventListener(
    "change",
    function () {
        renderDishes();
    }
);


sortDishes.addEventListener(
    "change",
    function () {
        renderDishes();
    }
);


// ======================================================
// Gericht löschen
// ======================================================

function deleteDish(id) {
    const dishIndex =
        dishes.findIndex(function (dish) {
            return dish.id === id;
        });


    if (dishIndex === -1) {
        return;
    }


    dishes.splice(dishIndex, 1);


    saveDishes();

    renderDishes();
}


// ======================================================
// Verfügbarkeit ändern
// ======================================================

function toggleDishAvailability(id) {
    const dish = dishes.find(function (dish) {
        return dish.id === id;
    });


    if (!dish) {
        return;
    }


    dish.available = !dish.available;


    saveDishes();

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


    const submitButton =
        dishForm.querySelector(
            'button[type="submit"]'
        );


    submitButton.textContent =
        "Änderungen speichern";
}


// ======================================================
// Bestellungen: Gerichte für Auswahl laden
// ======================================================

function updateOrderDishOptions() {
    const selectedDishId =
        orderDishSelect.value;


    orderDishSelect.innerHTML =
        '<option value="">Gericht wählen</option>';


    const availableDishes =
        dishes.filter(function (dish) {
            return dish.available;
        });


    availableDishes.forEach(function (dish) {
        const option =
            document.createElement("option");


        option.value = dish.id;


        option.textContent =
            `${dish.name} - ${formatCurrency(dish.price)}`;


        orderDishSelect.appendChild(option);
    });


    const selectedDishStillExists =
        availableDishes.some(function (dish) {
            return String(dish.id) === selectedDishId;
        });


    if (selectedDishStillExists) {
        orderDishSelect.value =
            selectedDishId;
    }
}


// ======================================================
// Neue Bestellung hinzufügen
// ======================================================

orderForm.addEventListener("submit", function (event) {
    event.preventDefault();


    const tableNumber =
        Number(orderTableInput.value);

    const dishId =
        Number(orderDishSelect.value);

    const quantity =
        Number(orderQuantityInput.value);


    const dish =
        dishes.find(function (dish) {
            return dish.id === dishId;
        });


    if (
        !dish ||
        !dish.available ||
        tableNumber < 1 ||
        quantity < 1
    ) {
        return;
    }


    const newOrder = {
        id: Date.now(),

        table: tableNumber,

        dishId: dish.id,

        dishName: dish.name,

        price: Number(dish.price),

        quantity: quantity,

        status: "Offen",

        paymentMethod: "",

        tip: 0,

        totalPaid: null
    };


    orders.push(newOrder);


    saveOrders();

    renderOrders();


    orderForm.reset();

    orderQuantityInput.value = 1;
});


// ======================================================
// Bestellungen rendern
// ======================================================

function renderOrders() {
    orderList.innerHTML = "";


    orders.forEach(function (order) {
        const orderCard =
            document.createElement("div");


        orderCard.classList.add(
            "order-card"
        );


        const subtotal =
            getOrderSubtotal(order);


        const storedTip =
            Number(order.tip ?? 0);


        const storedTotalPaid =
            order.totalPaid !== null &&
            order.totalPaid !== undefined
                ? Number(order.totalPaid)
                : subtotal;


        const storedPaymentMethod =
            order.paymentMethod ||
            "Nicht angegeben";


        orderCard.innerHTML = `
            <div class="order-info">

                <h3>
                    Tisch ${order.table}
                </h3>


                <p>
                    ${order.quantity}
                    ×
                    ${order.dishName}
                </p>


                <p>
                    Status:
                    ${order.status}
                </p>


                ${
                    order.status === "Bezahlt"
                        ? `
                            <div class="payment-details">

                                <p>
                                    Zahlungsart:
                                    ${storedPaymentMethod}
                                </p>

                                <p>
                                    Trinkgeld:
                                    ${formatCurrency(storedTip)}
                                </p>

                                <p>
                                    Bezahlt:
                                    ${formatCurrency(storedTotalPaid)}
                                </p>

                            </div>
                        `
                        : ""
                }

            </div>


            <div class="order-actions">

                <strong>
                    ${formatCurrency(subtotal)}
                </strong>


                ${
                    order.status === "Bezahlt"
                        ? `
                            <button
                                type="button"
                                class="receipt-button"
                                data-id="${order.id}"
                            >
                                Rechnung
                            </button>
                        `
                        : ""
                }


                ${
                    order.status !== "Bezahlt" &&
                    order.status !== "Storniert"
                        ? `
                            <button
                                type="button"
                                class="next-status-button"
                                data-id="${order.id}"
                            >
                                ${getNextStatusLabel(order.status)}
                            </button>
                        `
                        : ""
                }


                ${
                    order.status !== "Bezahlt" &&
                    order.status !== "Storniert"
                        ? `
                            <button
                                type="button"
                                class="cancel-order-button"
                                data-id="${order.id}"
                            >
                                Stornieren
                            </button>
                        `
                        : ""
                }

            </div>
        `;


        orderList.appendChild(orderCard);
    });
}


// ======================================================
// Nächsten Bestellstatus bestimmen
// ======================================================

function getNextStatusLabel(status) {
    if (status === "Offen") {
        return "In Zubereitung";
    }


    if (status === "In Zubereitung") {
        return "Fertig";
    }


    if (status === "Fertig") {
        return "Serviert";
    }


    if (status === "Serviert") {
        return "Bezahlen";
    }


    return "";
}


// ======================================================
// Buttons in der Bestellungsliste
// ======================================================

orderList.addEventListener("click", function (event) {
    const button = event.target;


    if (
        button.classList.contains(
            "next-status-button"
        )
    ) {
        const id =
            Number(button.dataset.id);

        advanceOrderStatus(id);
    }


    if (
        button.classList.contains(
            "cancel-order-button"
        )
    ) {
        const id =
            Number(button.dataset.id);

        cancelOrder(id);
    }


    if (
        button.classList.contains(
            "receipt-button"
        )
    ) {
        const id =
            Number(button.dataset.id);

        showReceipt(id);
    }
});


// ======================================================
// Bestellstatus ändern
// ======================================================

function advanceOrderStatus(id) {
    const order =
        orders.find(function (order) {
            return order.id === id;
        });


    if (!order) {
        return;
    }


    if (order.status === "Offen") {
        order.status =
            "In Zubereitung";
    }


    else if (
        order.status ===
        "In Zubereitung"
    ) {
        order.status = "Fertig";
    }


    else if (
        order.status === "Fertig"
    ) {
        order.status = "Serviert";
    }


    else if (
        order.status === "Serviert"
    ) {
        openPayment(order);

        return;
    }


    saveOrders();

    renderOrders();
}


// ======================================================
// Bestellung stornieren
// ======================================================

function cancelOrder(id) {
    const order =
        orders.find(function (order) {
            return order.id === id;
        });


    if (!order) {
        return;
    }


    order.status = "Storniert";


    saveOrders();

    renderOrders();
}


// ======================================================
// Bezahlung öffnen
// ======================================================

function openPayment(order) {
    payingOrderId = order.id;


    const subtotal =
        getOrderSubtotal(order);


    paymentTable.textContent =
        order.table;


    paymentSubtotal.textContent =
        formatCurrency(subtotal);


    paymentMethod.value = "Bar";


    tipSelect.value = "0";

    customTipInput.value = "";


    customTipGroup.classList.add(
        "hidden"
    );


    paymentPanel.classList.remove(
        "hidden"
    );


    updatePaymentSummary();
}


// ======================================================
// Trinkgeld und Gesamtbetrag berechnen
// ======================================================

function calculateCurrentTip(subtotal) {
    if (tipSelect.value === "custom") {
        return (
            Number(customTipInput.value) ||
            0
        );
    }


    const tipPercentage =
        Number(tipSelect.value);


    return (
        subtotal *
        (tipPercentage / 100)
    );
}


function updatePaymentSummary() {
    const order =
        orders.find(function (order) {
            return order.id === payingOrderId;
        });


    if (!order) {
        return;
    }


    const subtotal =
        getOrderSubtotal(order);


    const tip =
        calculateCurrentTip(subtotal);


    const total =
        subtotal + tip;


    paymentTip.textContent =
        formatCurrency(tip);


    paymentTotal.textContent =
        formatCurrency(total);
}


// ======================================================
// Bezahlung: Events
// ======================================================

tipSelect.addEventListener(
    "change",
    function () {
        if (
            tipSelect.value === "custom"
        ) {
            customTipGroup.classList.remove(
                "hidden"
            );

            customTipInput.focus();
        }

        else {
            customTipGroup.classList.add(
                "hidden"
            );
        }


        updatePaymentSummary();
    }
);


customTipInput.addEventListener(
    "input",
    function () {
        updatePaymentSummary();
    }
);


closePaymentButton.addEventListener(
    "click",
    function () {
        paymentPanel.classList.add(
            "hidden"
        );

        payingOrderId = null;
    }
);


confirmPaymentButton.addEventListener(
    "click",
    function () {
        const order =
            orders.find(function (order) {
                return (
                    order.id === payingOrderId
                );
            });


        if (!order) {
            return;
        }


        const subtotal =
            getOrderSubtotal(order);


        const tip =
            calculateCurrentTip(subtotal);


        order.status = "Bezahlt";

        order.paymentMethod =
            paymentMethod.value;

        order.tip = tip;

        order.totalPaid =
            subtotal + tip;


        // Tisch automatisch freigeben
        freeTable(order.table);


        saveOrders();

        renderOrders();


        paymentPanel.classList.add(
            "hidden"
        );


        payingOrderId = null;
    }
);


// ======================================================
// Rechnung anzeigen
// ======================================================

function showReceipt(id) {
    const order =
        orders.find(function (order) {
            return order.id === id;
        });


    if (
        !order ||
        order.status !== "Bezahlt"
    ) {
        return;
    }


    const subtotal =
        getOrderSubtotal(order);


    const tip =
        Number(order.tip ?? 0);


    const totalPaid =
        order.totalPaid !== null &&
        order.totalPaid !== undefined
            ? Number(order.totalPaid)
            : subtotal;


    const selectedPaymentMethod =
        order.paymentMethod ||
        "Nicht angegeben";


    alert(
`RestaurantOS Rechnung

Tisch: ${order.table}

Gericht:
${order.quantity} × ${order.dishName}

Zwischensumme: ${formatCurrency(subtotal)}
Trinkgeld: ${formatCurrency(tip)}
Gesamt: ${formatCurrency(totalPaid)}

Zahlungsart: ${selectedPaymentMethod}`
    );
}


// ======================================================
// Reservierung hinzufügen
// ======================================================

reservationForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();


        const name =
            reservationNameInput.value.trim();

        const phone =
            reservationPhoneInput.value.trim();

        const date =
            reservationDateInput.value;

        const time =
            reservationTimeInput.value;

        const guests =
            Number(
                reservationGuestsInput.value
            );


        if (
            name === "" ||
            phone === "" ||
            date === "" ||
            time === "" ||
            guests < 1
        ) {
            return;
        }


        const newReservation = {
            id: Date.now(),

            name: name,

            phone: phone,

            date: date,

            time: time,

            guests: guests,

            tableId: null,

            status: "Reserviert"
        };


        reservations.push(
            newReservation
        );


        saveReservations();

        renderReservations();


        reservationForm.reset();

        reservationGuestsInput.value = 2;
    }
);


// ======================================================
// Reservierungen anzeigen
// ======================================================

function renderReservations() {
    reservationList.innerHTML = "";


    reservations.forEach(
        function (reservation) {
            const card =
                document.createElement("div");


            card.classList.add(
                "reservation-card"
            );


            const assignedTable =
                reservation.tableId !== null
                    ? tables.find(
                        function (table) {
                            return (
                                table.id ===
                                reservation.tableId
                            );
                        }
                    )
                    : null;


            card.innerHTML = `
                <h3>
                    ${reservation.name}
                </h3>


                <p>
                    Telefon:
                    ${reservation.phone}
                </p>


                <p>
                    Datum:
                    ${reservation.date}
                </p>


                <p>
                    Uhrzeit:
                    ${reservation.time}
                </p>


                <p>
                    Personen:
                    ${reservation.guests}
                </p>


                <p>
                    Status:
                    ${reservation.status}
                </p>


                ${
                    assignedTable
                        ? `
                            <p>
                                Tisch:
                                ${assignedTable.number}
                            </p>
                        `
                        : ""
                }


                ${
                    reservation.status ===
                    "Reserviert"
                        ? `
                            <button
                                type="button"
                                class="arrived-button"
                                data-id="${reservation.id}"
                            >
                                Angekommen
                            </button>


                            <button
                                type="button"
                                class="cancel-reservation-button"
                                data-id="${reservation.id}"
                            >
                                Stornieren
                            </button>
                        `
                        : ""
                }
            `;


            reservationList.appendChild(
                card
            );
        }
    );
}


// ======================================================
// Buttons in der Reservierungsliste
// ======================================================

reservationList.addEventListener(
    "click",
    function (event) {
        const button = event.target;


        // ----------------------------------------------
        // Gast ist angekommen
        // ----------------------------------------------

        if (
            button.classList.contains(
                "arrived-button"
            )
        ) {
            const reservationId =
                Number(button.dataset.id);


            const reservation =
                reservations.find(
                    function (reservation) {
                        return (
                            reservation.id ===
                            reservationId
                        );
                    }
                );


            if (!reservation) {
                return;
            }


            // Nur freie Tische,
            // die genügend Plätze haben
            const suitableTables =
                tables.filter(function (table) {
                    return (
                        table.status === "Frei" &&
                        table.seats >=
                        reservation.guests
                    );
                });


            if (
                suitableTables.length === 0
            ) {
                alert(
                    "Kein passender freier Tisch verfügbar."
                );

                return;
            }


            const tableId = prompt(
                "Freien Tisch auswählen:\n\n" +

                suitableTables
                    .map(function (table) {
                        return (
                            "ID " +
                            table.id +
                            " - Tisch " +
                            table.number +
                            " (" +
                            table.seats +
                            " Plätze)"
                        );
                    })
                    .join("\n")
            );


            if (!tableId) {
                return;
            }


            assignTable(
                reservationId,
                Number(tableId)
            );
        }


        // ----------------------------------------------
        // Reservierung stornieren
        // ----------------------------------------------

        if (
            button.classList.contains(
                "cancel-reservation-button"
            )
        ) {
            const reservationId =
                Number(button.dataset.id);


            changeReservationStatus(
                reservationId,
                "Storniert"
            );
        }
    }
);


// ======================================================
// Reservierungsstatus ändern
// ======================================================

function changeReservationStatus(
    reservationId,
    status
) {
    const reservation =
        reservations.find(
            function (reservation) {
                return (
                    reservation.id ===
                    reservationId
                );
            }
        );


    if (!reservation) {
        return;
    }


    reservation.status = status;


    saveReservations();

    renderReservations();
}


// ======================================================
// Tisch einer Reservierung zuweisen
// ======================================================

function assignTable(
    reservationId,
    tableId
) {
    const reservation =
        reservations.find(
            function (reservation) {
                return (
                    reservation.id ===
                    reservationId
                );
            }
        );


    const table =
        tables.find(function (table) {
            return table.id === tableId;
        });


    if (
        !reservation ||
        !table
    ) {
        alert(
            "Reservierung oder Tisch wurde nicht gefunden."
        );

        return;
    }


    if (table.status !== "Frei") {
        alert(
            "Dieser Tisch ist nicht mehr frei."
        );

        return;
    }


    if (
        table.seats <
        reservation.guests
    ) {
        alert(
            "Dieser Tisch hat nicht genügend Plätze."
        );

        return;
    }


    reservation.tableId =
        table.id;

    reservation.status =
        "Angekommen";


    table.status =
        "Besetzt";


    saveReservations();

    saveTables();


    renderReservations();

    renderTables();
}


// ======================================================
// Tische anzeigen
// ======================================================

function renderTables() {
    tableList.innerHTML = "";


    tables.forEach(function (table) {
        const tableCard =
            document.createElement("div");


        tableCard.classList.add(
            "table-card"
        );


        tableCard.innerHTML = `
            <h3>
                Tisch ${table.number}
            </h3>


            <p>
                Plätze:
                ${table.seats}
            </p>


            <p>
                Status:
                ${table.status}
            </p>


            ${
                table.status === "Frei"
                    ? `
                        <button
                            type="button"
                            class="occupy-table-button"
                            data-id="${table.id}"
                        >
                            Besetzen
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="free-table-button"
                            data-id="${table.id}"
                        >
                            Freigeben
                        </button>
                    `
            }
        `;


        tableList.appendChild(
            tableCard
        );
    });
}


// ======================================================
// Buttons in der Tischliste
// ======================================================

tableList.addEventListener(
    "click",
    function (event) {
        const button = event.target;


        if (
            button.classList.contains(
                "occupy-table-button"
            )
        ) {
            const tableId =
                Number(button.dataset.id);


            changeTableStatus(
                tableId,
                "Besetzt"
            );
        }


        if (
            button.classList.contains(
                "free-table-button"
            )
        ) {
            const tableId =
                Number(button.dataset.id);


            changeTableStatus(
                tableId,
                "Frei"
            );
        }
    }
);


// ======================================================
// Tischstatus ändern
// ======================================================

function changeTableStatus(
    tableId,
    status
) {
    const table =
        tables.find(function (table) {
            return table.id === tableId;
        });


    if (!table) {
        return;
    }


    table.status = status;


    saveTables();

    renderTables();
}


// ======================================================
// Tisch nach Zahlung automatisch freigeben
// ======================================================

function freeTable(tableNumber) {
    const table =
        tables.find(function (table) {
            return (
                table.number ===
                Number(tableNumber)
            );
        });


    if (!table) {
        return;
    }


    table.status = "Frei";


    saveTables();

    renderTables();
}


// ======================================================
// LocalStorage
// ======================================================

function saveDishes() {
    localStorage.setItem(
        "dishes",
        JSON.stringify(dishes)
    );
}


function saveOrders() {
    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );
}


function saveReservations() {
    localStorage.setItem(
        "reservations",
        JSON.stringify(reservations)
    );
}


function saveTables() {
    localStorage.setItem(
        "tables",
        JSON.stringify(tables)
    );
}


// ======================================================
// Initialer Start
// ======================================================

function init() {
    renderDishes();

    renderOrders();

    renderReservations();

    renderTables();
}


init();