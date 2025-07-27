
document.addEventListener('DOMContentLoaded', () => {
    const itemSearchInput = document.getElementById('item-search');
    const itemSuggestionsDiv = document.getElementById('item-suggestions');
    const selectedItemIdInput = document.getElementById('selected-item-id');
    const orderEntryForm = document.getElementById('order-entry-form');
    const messageElement = document.getElementById('message');

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
                // Django REST Frameworkの検索エンドポイントを使用
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

    // 発注フォームの送信
    orderEntryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const itemId = selectedItemIdInput.value;
        const orderQuantity = document.getElementById('order_quantity').value;

        if (!itemId) {
            messageElement.textContent = '物品を選択してください。';
            messageElement.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    item: itemId, // Django REST Frameworkではitem_idではなくitem
                    order_date: new Date().toISOString().split('T')[0],
                    order_quantity: parseInt(orderQuantity)
                })
            });

            if (response.ok) {
                messageElement.textContent = '発注が正常に登録されました。';
                messageElement.style.color = 'green';
                orderEntryForm.reset();
                selectedItemIdInput.value = ''; // 選択された物品IDをクリア
            } else {
                const errorData = await response.json();
                let errorMessage = '発注失敗: ';
                if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
                    errorMessage += errorData.non_field_errors[0];
                } else if (errorData.detail) {
                    errorMessage += errorData.detail;
                } else {
                    errorMessage += JSON.stringify(errorData);
                }
                messageElement.textContent = errorMessage;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('発注エラー:', error);
            messageElement.textContent = '発注中にエラーが発生しました。';
            messageElement.style.color = 'red';
        }
    });

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
});
