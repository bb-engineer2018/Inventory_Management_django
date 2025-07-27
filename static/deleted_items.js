
document.addEventListener('DOMContentLoaded', () => {
    const deletedItemsTableBody = document.querySelector('#deleted-items-table tbody');
    const deletedItemSearchInput = document.getElementById('deleted-item-search');
    const deletedItemSuggestionsDiv = document.getElementById('deleted-item-suggestions');
    const selectedDeletedItemIdInput = document.getElementById('selected-deleted-item-id');
    const deletedItemFilterForm = document.getElementById('deleted-item-filter-form');
    const showAllDeletedItemsButton = document.getElementById('show-all-deleted-items');

    const messageElement = document.createElement('p');
    messageElement.id = 'deleted-items-message';
    deletedItemsTableBody.parentNode.insertBefore(messageElement, deletedItemsTableBody);

    let debounceTimer;

    // 削除済み物品の検索サジェスト機能
    deletedItemSearchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = deletedItemSearchInput.value;
            if (query.length < 1) {
                deletedItemSuggestionsDiv.innerHTML = '';
                return;
            }
            try {
                // 削除済み物品の検索APIエンドポイントを使用
                const response = await fetch(`/api/items/deleted/?search=${query}`);
                const data = await response.json();
                deletedItemSuggestionsDiv.innerHTML = '';
                if (data.length === 0) {
                    const noResultDiv = document.createElement('div');
                    noResultDiv.textContent = '該当する物品はありません。';
                    noResultDiv.classList.add('suggestion-item');
                    deletedItemSuggestionsDiv.appendChild(noResultDiv);
                } else {
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.textContent = item.name;
                        div.classList.add('suggestion-item');
                        div.addEventListener('click', () => {
                            deletedItemSearchInput.value = item.name;
                            selectedDeletedItemIdInput.value = item.id;
                            deletedItemSuggestionsDiv.innerHTML = '';
                        });
                        deletedItemSuggestionsDiv.appendChild(div);
                    });
                }
            } catch (error) {
                console.error('削除済み物品検索エラー:', error);
            }
        }, 300);
    });

    // フィルタリングフォームの送信
    deletedItemFilterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        fetchDeletedItems();
    });

    // 全部表示ボタンのクリックイベント
    showAllDeletedItemsButton.addEventListener('click', () => {
        deletedItemSearchInput.value = '';
        selectedDeletedItemIdInput.value = '';
        deletedItemSuggestionsDiv.innerHTML = '';
        fetchDeletedItems(); // フィルタなしで再取得
    });

    async function fetchDeletedItems() {
        const itemId = selectedDeletedItemIdInput.value;
        let url = '/api/items/deleted/';

        const params = new URLSearchParams();
        if (itemId) {
            params.append('id', itemId);
        }
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        try {
            const response = await fetch(url);
            const items = await response.json();
            renderDeletedItemsTable(items);
        } catch (error) {
            console.error('削除済み物品の取得エラー:', error);
        }
    }

    function renderDeletedItemsTable(items) {
        deletedItemsTableBody.innerHTML = '';
        if (items.length === 0) {
            messageElement.textContent = '該当する削除済み物品はありません。';
            messageElement.style.color = 'orange';
        } else {
            messageElement.textContent = '';
            items.forEach(item => {
                const row = deletedItemsTableBody.insertRow();
                row.insertCell().textContent = item.name;
                row.insertCell().textContent = item.supplier;
                row.insertCell().textContent = item.standard;
                row.insertCell().textContent = item.unit;
                row.insertCell().textContent = item.quantity_per_pack;
                row.insertCell().textContent = item.storage_location;
                row.insertCell().textContent = item.management_method_name;
                row.insertCell().textContent = item.delivery_price;

                const actionsCell = row.insertCell();
                const restoreButton = document.createElement('button');
                restoreButton.textContent = '復元';
                restoreButton.classList.add('button', 'info');
                restoreButton.addEventListener('click', async () => {
                    if (confirm(`本当に ${item.name} を復元しますか？`)) {
                        try {
                            const response = await fetch(`/api/items/${item.id}/restore/`, {
                                method: 'POST',
                                headers: { 'X-CSRFToken': getCookie('csrftoken') }
                            });
                            if (response.ok) {
                                alert('物品が復元されました。');
                                fetchDeletedItems(); // リストを再読み込み
                            } else {
                                const errorData = await response.json();
                                alert(`復元失敗: ${errorData.error || response.statusText}`);
                            }
                        } catch (error) {
                            console.error('物品復元エラー:', error);
                            alert('物品復元中にエラーが発生しました。');
                        }
                    }
                });
                actionsCell.appendChild(restoreButton);
            });
        }
    }

    // CSRFトークンを取得するヘルパー関数
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 初期データの読み込み
    fetchDeletedItems();
});
