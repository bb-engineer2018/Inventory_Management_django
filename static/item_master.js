document.addEventListener('DOMContentLoaded', () => {
    const itemSearchInput = document.getElementById('item-search');
    const itemSuggestionsDiv = document.getElementById('item-suggestions');
    const selectedItemIdInput = document.getElementById('selected-item-id');
    const itemFilterForm = document.getElementById('item-filter-form');
    const resetItemFiltersButton = document.getElementById('reset-item-filters');
    const showAllItemsButton = document.getElementById('show-all-items');

    const itemsTableBody = document.querySelector('#items-table tbody');
    const messageElement = document.createElement('p');
    messageElement.id = 'item-master-message';
    itemsTableBody.parentNode.insertBefore(messageElement, itemsTableBody);

    // 編集モーダル関連要素
    const editModal = document.getElementById('edit-item-modal');
    const closeButton = editModal.querySelector('.close-button');
    const editItemForm = document.getElementById('edit-item-form');
    const editItemIdInput = document.getElementById('edit-item-id');
    const editNameInput = document.getElementById('edit-name');
    const editSupplierInput = document.getElementById('edit-supplier');
    const editStandardInput = document.getElementById('edit-standard');
    const editUnitInput = document.getElementById('edit-unit');
    const editQuantityPerPackInput = document.getElementById('edit-quantity_per_pack');
    const editStorageLocationInput = document.getElementById('edit-storage_location');
    const editManagementMethodSelect = document.getElementById('edit-management_method');
    const editDeliveryPriceInput = document.getElementById('edit-delivery_price');

    let debounceTimer;

    // 管理方法の読み込み (編集モーダル用)
    async function loadManagementMethodsForEdit() {
        try {
            const response = await fetch('/api/management-methods/');
            const methods = await response.json();
            editManagementMethodSelect.innerHTML = '';
            methods.forEach(method => {
                const option = document.createElement('option');
                option.value = method.id;
                option.textContent = method.method_name;
                editManagementMethodSelect.appendChild(option);
            });
        } catch (error) {
            console.error('管理方法の取得エラー:', error);
            alert('管理方法の読み込みに失敗しました。');
        }
    }

    // 物品検索のサジェスト機能
    itemSearchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = itemSearchInput.value;
            if (query.length < 1) {
                itemSuggestionsDiv.innerHTML = '';
                return;
            }
            try {
                const response = await fetch(`/api/items/?search=${query}`);
                const data = await response.json();
                itemSuggestionsDiv.innerHTML = '';
                if (data.length === 0) {
                    const noResultDiv = document.createElement('div');
                    noResultDiv.textContent = '該当する物品はありません。';
                    noResultDiv.classList.add('suggestion-item');
                    itemSuggestionsDiv.appendChild(noResultDiv);
                } else {
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.textContent = item.name;
                        div.classList.add('suggestion-item');
                        div.addEventListener('click', () => {
                            itemSearchInput.value = item.name;
                            selectedItemIdInput.value = item.id;
                            itemSuggestionsDiv.innerHTML = '';
                        });
                        itemSuggestionsDiv.appendChild(div);
                    });
                }
            } catch (error) {
                console.error('物品検索エラー:', error);
            }
        }, 300);
    });

    // フィルタリングフォームの送信
    itemFilterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        fetchItemsData();
    });

    // フィルタリングのリセット
    resetItemFiltersButton.addEventListener('click', () => {
        itemSearchInput.value = '';
        selectedItemIdInput.value = '';
        itemSuggestionsDiv.innerHTML = '';
        fetchItemsData();
    });

    // 全部表示ボタンのクリックイベント
    showAllItemsButton.addEventListener('click', () => {
        itemSearchInput.value = '';
        selectedItemIdInput.value = '';
        itemSuggestionsDiv.innerHTML = '';
        fetchItemsData(); // フィルタなしで再取得
    });

    async function fetchItemsData() {
        const itemId = selectedItemIdInput.value;

        let itemsUrl = '/api/items/';

        const itemParams = new URLSearchParams();
        if (itemId) {
            itemParams.append('id', itemId);
        }
        const itemQueryString = itemParams.toString();
        if (itemQueryString) {
            itemsUrl += `?${itemQueryString}`;
        }

        try {
            const response = await fetch(itemsUrl);
            const items = await response.json();
            renderItems(items);

        } catch (error) {
            console.error('物品マスタデータの取得エラー:', error);
        }
    }

    function renderItems(items) {
        itemsTableBody.innerHTML = '';
        if (items.length === 0) {
            messageElement.textContent = '該当する物品は登録されていません。';
            messageElement.style.color = 'orange';
        } else {
            messageElement.textContent = ''; // メッセージをクリア
            items.forEach(item => {
                const row = itemsTableBody.insertRow();
                row.insertCell().textContent = item.name;
                row.insertCell().textContent = item.supplier;
                row.insertCell().textContent = item.standard;
                row.insertCell().textContent = item.unit;
                row.insertCell().textContent = item.quantity_per_pack;
                row.insertCell().textContent = item.storage_location;
                row.insertCell().textContent = item.management_method_name;
                row.insertCell().textContent = item.delivery_price;

                const actionsCell = row.insertCell();
                const editButton = document.createElement('button');
                editButton.textContent = '編集';
                editButton.classList.add('button', 'secondary');
                editButton.addEventListener('click', () => openEditModal(item));
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = '削除';
                deleteButton.classList.add('button', 'danger');
                deleteButton.addEventListener('click', async () => {
                    if (confirm(`本当に ${item.name} を削除しますか？`)) {
                        try {
                            const response = await fetch(`/api/items/${item.id}/delete_item/`, {
                                method: 'POST',
                                headers: { 'X-CSRFToken': getCookie('csrftoken') }
                            });
                            if (response.ok) {
                                alert('物品が削除されました。');
                                fetchItemsData();
                            } else {
                                const errorData = await response.json();
                                alert(`削除失敗: ${errorData.error || response.statusText}`);
                            }
                        } catch (error) {
                            console.error('物品削除エラー:', error);
                            alert('物品削除中にエラーが発生しました。');
                        }
                    }
                });
                actionsCell.appendChild(deleteButton);
            });
        }
    }

    // 編集モーダルを開く
    function openEditModal(item) {
        editItemIdInput.value = item.id;
        editNameInput.value = item.name;
        editSupplierInput.value = item.supplier;
        editStandardInput.value = item.standard;
        editUnitInput.value = item.unit;
        editQuantityPerPackInput.value = item.quantity_per_pack;
        editStorageLocationInput.value = item.storage_location;
        editDeliveryPriceInput.value = item.delivery_price;

        // 管理方法の選択
        if (item.management_method) {
            editManagementMethodSelect.value = item.management_method;
        } else {
            editManagementMethodSelect.value = ''; // デフォルト値
        }

        editModal.style.display = 'block';
    }

    // 編集モーダルを閉じる
    closeButton.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // 編集フォームの送信
    editItemForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const itemId = editItemIdInput.value;
        const formData = new FormData(editItemForm);
        const data = Object.fromEntries(formData.entries());

        // 数値型に変換
        data.quantity_per_pack = data.quantity_per_pack ? parseInt(data.quantity_per_pack) : null;
        data.delivery_price = data.delivery_price ? parseFloat(data.delivery_price) : null;
        data.management_method = data.management_method ? parseInt(data.management_method) : null; // IDを数値に変換

        try {
            const response = await fetch(`/api/items/${itemId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('物品が正常に更新されました。');
                editModal.style.display = 'none';
                fetchItemsData(); // リストを再読み込み
            } else {
                const errorData = await response.json();
                alert(`更新失敗: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('物品更新エラー:', error);
            alert('物品更新中にエラーが発生しました。');
        }
    });

    // CSRFトークンを取得するヘルパー関数
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 初期データの読み込み
    fetchItemsData();
    loadManagementMethodsForEdit(); // 管理方法を読み込む
});