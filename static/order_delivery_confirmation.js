document.addEventListener('DOMContentLoaded', () => {
    const itemSearchInput = document.getElementById('item-search');
    const itemSuggestionsDiv = document.getElementById('item-suggestions');
    const selectedItemIdInput = document.getElementById('selected-item-id');
    const orderFilterForm = document.getElementById('order-filter-form');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const resetOrderFiltersButton = document.getElementById('reset-order-filters');
    const showAllOrdersButton = document.getElementById('show-all-orders'); // 追加

    const pendingOrdersTableBody = document.querySelector('#pending-orders-table tbody');
    const deliveredOrdersTableBody = document.querySelector('#delivered-orders-table tbody');

    // 編集モーダル関連要素
    const editOrderModal = document.getElementById('edit-order-modal');
    const closeEditOrderButton = editOrderModal.querySelector('.close-button');
    const editOrderForm = document.getElementById('edit-order-form');
    const editOrderIdInput = document.getElementById('edit-order-id');
    const editOrderItemNameInput = document.getElementById('edit-order-item-name');
    const editOrderQuantityInput = document.getElementById('edit-order-quantity');

    const pendingOrdersMessageElement = document.createElement('p');
    pendingOrdersMessageElement.id = 'pending-orders-message';
    pendingOrdersTableBody.parentNode.insertBefore(pendingOrdersMessageElement, pendingOrdersTableBody);

    const deliveredOrdersMessageElement = document.createElement('p');
    deliveredOrdersMessageElement.id = 'delivered-orders-message';
    deliveredOrdersTableBody.parentNode.insertBefore(deliveredOrdersMessageElement, deliveredOrdersTableBody);

    let debounceTimer;

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
    orderFilterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        fetchOrderDeliveryData();
    });

    // フィルタリングのリセット
    resetOrderFiltersButton.addEventListener('click', () => {
        itemSearchInput.value = '';
        selectedItemIdInput.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        itemSuggestionsDiv.innerHTML = '';
        fetchOrderDeliveryData();
    });

    // 全部表示ボタンのクリックイベント
    showAllOrdersButton.addEventListener('click', () => {
        itemSearchInput.value = '';
        selectedItemIdInput.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        itemSuggestionsDiv.innerHTML = '';
        fetchOrderDeliveryData(); // フィルタなしで再取得
    });

    async function fetchOrderDeliveryData() {
        const itemId = selectedItemIdInput.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        let pendingOrdersUrl = '/api/orders/';
        let deliveredOrdersUrl = '/api/delivered-orders/';

        const orderParams = new URLSearchParams();
        if (itemId) {
            orderParams.append('item', itemId);
        }
        if (startDate) {
            orderParams.append('order_date__gte', startDate);
        }
        if (endDate) {
            orderParams.append('order_date__lte', endDate);
        }
        const orderQueryString = orderParams.toString();
        if (orderQueryString) {
            pendingOrdersUrl += `?${orderQueryString}`;
        }

        const deliveredOrderParams = new URLSearchParams();
        if (itemId) {
            deliveredOrderParams.append('item', itemId);
        }
        if (startDate) {
            deliveredOrderParams.append('delivery_date__gte', startDate);
        }
        if (endDate) {
            deliveredOrderParams.append('delivery_date__lte', endDate);
        }
        const deliveredOrderQueryString = deliveredOrderParams.toString();
        if (deliveredOrderQueryString) {
            deliveredOrdersUrl += `?${deliveredOrderQueryString}`;
        }

        try {
            const [pendingOrdersResponse, deliveredOrdersResponse] = await Promise.all([
                fetch(pendingOrdersUrl),
                fetch(deliveredOrdersUrl)
            ]);

            const pendingOrders = await pendingOrdersResponse.json();
            const deliveredOrders = await deliveredOrdersResponse.json();

            renderPendingOrders(pendingOrders);
            renderDeliveredOrders(deliveredOrders);

        } catch (error) {
            console.error('注文・納品データの取得エラー:', error);
        }
    }

    function renderPendingOrders(orders) {
        pendingOrdersTableBody.innerHTML = '';
        if (orders.length === 0) {
            pendingOrdersMessageElement.textContent = '該当する未納品注文はありません。';
            pendingOrdersMessageElement.style.color = 'orange';
        } else {
            pendingOrdersMessageElement.textContent = '';
            orders.forEach(order => {
                const row = pendingOrdersTableBody.insertRow();
                row.insertCell().textContent = order.item_name;
                row.insertCell().textContent = order.order_date;
                row.insertCell().textContent = order.order_quantity;

                const actionsCell = row.insertCell();
                const deliverButton = document.createElement('button');
                deliverButton.textContent = '納品完了';
                deliverButton.classList.add('button', 'primary');
                deliverButton.addEventListener('click', async () => {
                    if (confirm(`注文ID ${order.id} の納品を完了しますか？`)) {
                        try {
                            const response = await fetch(`/api/orders/${order.id}/deliver/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': getCookie('csrftoken')
                                },
                                body: JSON.stringify({ delivery_date: new Date().toISOString().split('T')[0] })
                            });
                            if (response.ok) {
                                alert('納品が完了しました。');
                                fetchOrderDeliveryData();
                            } else {
                                const errorData = await response.json();
                                alert(`納品失敗: ${errorData.error || response.statusText}`);
                            }
                        } catch (error) {
                            console.error('納品完了エラー:', error);
                            alert('納品完了中にエラーが発生しました。');
                        }
                    }
                });
                actionsCell.appendChild(deliverButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = '削除';
                deleteButton.classList.add('button', 'danger');
                deleteButton.addEventListener('click', async () => {
                    if (confirm(`注文ID ${order.id} を削除しますか？`)) {
                        try {
                            const response = await fetch(`/api/orders/${order.id}/delete_order/`, {
                                method: 'DELETE',
                                headers: { 'X-CSRFToken': getCookie('csrftoken') }
                            });
                            if (response.ok) {
                                alert('注文が削除されました。');
                                fetchOrderDeliveryData();
                            } else {
                                const errorData = await response.json();
                                alert(`削除失敗: ${errorData.error || response.statusText}`);
                            }
                        } catch (error) {
                            console.error('注文削除エラー:', error);
                            alert('注文削除中にエラーが発生しました。');
                        }
                    }
                });
                actionsCell.appendChild(deleteButton);

                const editButton = document.createElement('button');
                editButton.textContent = '編集';
                editButton.classList.add('button', 'secondary');
                editButton.addEventListener('click', () => openEditOrderModal(order));
                actionsCell.appendChild(editButton);
            });
        }
    }

    function renderDeliveredOrders(deliveredOrders) {
        deliveredOrdersTableBody.innerHTML = '';
        if (deliveredOrders.length === 0) {
            deliveredOrdersMessageElement.textContent = '該当する納品済み注文はありません。';
            deliveredOrdersMessageElement.style.color = 'orange';
        } else {
            deliveredOrdersMessageElement.textContent = '';
            deliveredOrders.forEach(order => {
                const row = deliveredOrdersTableBody.insertRow();
                row.insertCell().textContent = order.item_name;
                row.insertCell().textContent = order.order_date;
                row.insertCell().textContent = order.order_quantity;
                row.insertCell().textContent = order.delivery_date;

                const actionsCell = row.insertCell();
                const revertButton = document.createElement('button');
                revertButton.textContent = '未納品に戻す';
                revertButton.classList.add('button', 'info');
                revertButton.addEventListener('click', async () => {
                    if (confirm(`納品ID ${order.id} を未納品に戻しますか？`)) {
                        try {
                            const response = await fetch(`/api/delivered-orders/${order.id}/revert/`, {
                                method: 'POST',
                                headers: { 'X-CSRFToken': getCookie('csrftoken') }
                            });
                            if (response.ok) {
                                alert('注文を未納品に戻しました。');
                                fetchOrderDeliveryData();
                            } else {
                                const errorData = await response.json();
                                alert(`差し戻し失敗: ${errorData.error || response.statusText}`);
                            }
                        } catch (error) {
                            console.error('差し戻しエラー:', error);
                            alert('差し戻し中にエラーが発生しました。');
                        }
                    }
                });
                actionsCell.appendChild(revertButton);
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
    fetchOrderDeliveryData();

    // 編集モーダルを開く
    function openEditOrderModal(order) {
        editOrderIdInput.value = order.id;
        editOrderItemNameInput.value = order.item_name;
        editOrderQuantityInput.value = order.order_quantity;
        editOrderModal.style.display = 'block';
    }

    // 編集モーダルを閉じる
    closeEditOrderButton.addEventListener('click', () => {
        editOrderModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editOrderModal) {
            editOrderModal.style.display = 'none';
        }
    });

    // 編集フォームの送信
    editOrderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const orderId = editOrderIdInput.value;
        const newQuantity = editOrderQuantityInput.value;

        try {
            const response = await fetch(`/api/orders/${orderId}/`, {
                method: 'PATCH', // 部分更新のためPATCHを使用
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ order_quantity: parseInt(newQuantity) })
            });

            if (response.ok) {
                alert('注文数が更新されました。');
                editOrderModal.style.display = 'none';
                fetchOrderDeliveryData(); // リストを再読み込み
            } else {
                const errorData = await response.json();
                alert(`更新失敗: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('注文更新エラー:', error);
            alert('注文更新中にエラーが発生しました。');
        }
    });
});