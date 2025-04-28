document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayMenu(); // Load menu when page loads
});

async function fetchAndDisplayMenu() {
    try {
        const response = await fetch("/api/menu");
        const menuItems = await response.json();

        const menuTableBody = document.getElementById("menuTableBody");
        menuTableBody.innerHTML = ""; // Clear previous contents

        menuItems.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="text-center">${item.name}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm" onclick="deleteMenuItem(${item.id})">Eliminar</button>
                </td>
            `;
            menuTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Error fetching menu items:", error);
    }
}

document.getElementById("addToMenuBtn").addEventListener("click", async () => {
    const checkboxes = document.querySelectorAll("input[name='productSelect']:checked");
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    try {
        // Get current menu
        const menuResponse = await fetch("/api/menu");
        const currentMenu = await menuResponse.json();
        const currentIds = currentMenu.map(item => item.id);

        // Prepare new items only
        const newItems = selectedIds
            .filter(id => !currentIds.includes(id))
            .map(id => ({ id }));

        // Send to backend
        await fetch("/api/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItems),
        });

        // ✅ Refresh both product list and menu table
        await fetchAndDisplayProducts(); // this re-filters products in modal
        await fetchAndDisplayMenu();     // this refreshes the main menu table

        // Optionally close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("addItemModal"));
        modal.hide();

    } catch (error) {
        console.error("❌ Error adding to menu:", error);
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const productsList = document.getElementById("productsList");
    const addToMenuBtn = document.getElementById("addToMenuBtn");

    if (!productsList || !addToMenuBtn) {
        console.error("Modal elements not found. Make sure your HTML matches the IDs.");
        return;
    }

    try {
        // Fetch all products and the current menu
        const [productsRes, menuRes] = await Promise.all([
            fetch("/api/products"),
            fetch("/api/menu")
        ]);

        const products = await productsRes.json();
        const menu = await menuRes.json();

        const menuProductIds = menu.map(item => item.id);

        // Filter out products already in the menu
        const availableProducts = products.filter(product => !menuProductIds.includes(product.id));

        // Populate the table with available products
        productsList.innerHTML = "";
        availableProducts.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" value="${product.id}"></td>
                <td>${product.id}</td>
                <td>${product.name}</td>
            `;
            productsList.appendChild(row);
        });

        // Add event listener to Add to Menu button
        addToMenuBtn.onclick = async () => {
            const selectedIds = Array.from(productsList.querySelectorAll("input[type='checkbox']:checked"))
                .map(checkbox => ({ id: parseInt(checkbox.value) }));


            const res = await fetch("/api/menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedIds)
            });

            if (res.ok) {
                alert("Productos agregados al menú.");
                await fetchAndDisplayMenu(); // Refresh menu after adding
                const modal = bootstrap.Modal.getInstance(document.getElementById("addItemModal"));
                modal.hide(); // Close modal after adding
            } else {
                alert("Error al agregar productos al menú.");
            }
        };

    } catch (err) {
        console.error("❌ Error fetching products or menu:", err);
    }
});

async function deleteMenuItem(productId) {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto del menú?")) return;

    try {
        const response = await fetch(`/api/menu/${productId}`, {
            method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);  // Display success message
        } else {
            alert(result.message);  // Display error message if not found
        }

        // Refresh the menu after deletion
        await fetchAndDisplayMenu();
    } catch (error) {
        console.error("❌ Error deleting menu item:", error);
    }
}