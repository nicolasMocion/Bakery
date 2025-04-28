document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('menuTableBody');
    const form = document.getElementById('addItemForm');
    const modalElement = document.getElementById('addItemModal');
    const editForm = document.getElementById('editItemForm');
    const editModal = document.getElementById('editItemModal');
    let currentEditingItemId = null;

    // Load items from backend
    const loadMenuItems = async () => {
        try {
            const response = await fetch('/api/products');
            const items = await response.json();

            tableBody.innerHTML = '';
            items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>${item.price}</td>
                    <td><img src="${item.image}" alt="${item.name}" style="width: 50px;"></td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${item.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Edit buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const itemId = button.getAttribute('data-id');
                    currentEditingItemId = itemId;

                    const res = await fetch(`/api/products/${itemId}`);
                    const item = await res.json();

                    document.getElementById('editItemName').value = item.name;
                    document.getElementById('editItemDescription').value = item.description;
                    document.getElementById('editItemPrice').value = item.price;
                    document.getElementById('editItemImage').value = item.image;

                    new bootstrap.Modal(editModal).show();
                });
            });

            // Delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const itemId = button.getAttribute('data-id');
                    await fetch(`/api/products/${itemId}`, {
                        method: 'DELETE',
                    });
                    loadMenuItems();
                });
            });
        } catch (error) {
            console.error('❌ Error loading menu items:', error);
        }
    };

    // Add new item
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const name = document.getElementById('itemName').value;
        const description = document.getElementById('itemDescription').value;
        const price = parseFloat(document.getElementById('itemPrice').value);
        const image = document.getElementById('itemImage').value;

        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, price, image }),
            });

            form.reset();
            bootstrap.Modal.getInstance(modalElement).hide();
            loadMenuItems();
        } catch (error) {
            console.error('❌ Error adding item:', error);
        }
    });

    // Edit existing item
    editForm.addEventListener('submit', async event => {
        event.preventDefault();
        const name = document.getElementById('editItemName').value;
        const description = document.getElementById('editItemDescription').value;
        const price = parseFloat(document.getElementById('editItemPrice').value);
        const image = document.getElementById('editItemImage').value;

        try {
            await fetch(`/api/products/${currentEditingItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, price, image }),
            });

            bootstrap.Modal.getInstance(editModal).hide();
            loadMenuItems();
        } catch (error) {
            console.error('❌ Error editing item:', error);
        }
    });

    // Load the menu initially
    loadMenuItems();
});