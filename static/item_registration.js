
document.addEventListener('DOMContentLoaded', () => {
    const itemRegistrationForm = document.getElementById('item-registration-form');
    const messageElement = document.getElementById('message');
    const managementMethodSelect = document.getElementById('management_method');
    const supplierSearchInput = document.getElementById('supplier');
    const supplierSuggestionsDiv = document.getElementById('supplier-suggestions');

    let debounceTimer;

    // 管理方法の読み込み
    async function loadManagementMethods() {
        try {
            const response = await fetch('/api/management-methods/');
            const methods = await response.json();
            managementMethodSelect.innerHTML = '';
            methods.forEach(method => {
                const option = document.createElement('option');
                option.value = method.id;
                option.textContent = method.method_name;
                managementMethodSelect.appendChild(option);
            });
        } catch (error) {
            console.error('管理方法の取得エラー:', error);
            messageElement.textContent = '管理方法の読み込みに失敗しました。';
            messageElement.style.color = 'red';
        }
    }

    // 納入業者検索のサジェスト機能
    supplierSearchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = supplierSearchInput.value;
            if (query.length < 1) {
                supplierSuggestionsDiv.innerHTML = '';
                return;
            }
            try {
                const response = await fetch(`/api/items/search/?search=${query}`); // Django REST Frameworkの検索は'search'パラメータ
                const data = await response.json();
                const uniqueSuppliers = [...new Set(data.map(item => item.supplier))].filter(s => s);

                supplierSuggestionsDiv.innerHTML = '';
                uniqueSuppliers.forEach(supplier => {
                    const div = document.createElement('div');
                    div.textContent = supplier;
                    div.classList.add('suggestion-item');
                    div.addEventListener('click', () => {
                        supplierSearchInput.value = supplier;
                        supplierSuggestionsDiv.innerHTML = '';
                    });
                    supplierSuggestionsDiv.appendChild(div);
                });
            } catch (error) {
                console.error('納入業者検索エラー:', error);
            }
        }, 300);
    });

    // 物品登録フォームの送信
    itemRegistrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(itemRegistrationForm);
        const data = Object.fromEntries(formData.entries());

        // 数値型に変換
        data.quantity_per_pack = data.quantity_per_pack ? parseInt(data.quantity_per_pack) : null;
        data.delivery_price = data.delivery_price ? parseFloat(data.delivery_price) : null;
        data.management_method = data.management_method ? parseInt(data.management_method) : null; // IDを数値に変換

        try {
            const response = await fetch('/api/items/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                messageElement.textContent = '物品が正常に登録されました。';
                messageElement.style.color = 'green';
                itemRegistrationForm.reset();
            } else {
                const errorData = await response.json();
                let errorMessage = '登録失敗: ';
                if (errorData.name && Array.isArray(errorData.name) && errorData.name.length > 0) {
                    errorMessage += errorData.name[0];
                } else if (errorData.detail) {
                    errorMessage += errorData.detail;
                } else {
                    errorMessage += JSON.stringify(errorData);
                }
                messageElement.textContent = errorMessage;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('物品登録エラー:', error);
            messageElement.textContent = '物品登録中にエラーが発生しました。';
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

    loadManagementMethods();
});
