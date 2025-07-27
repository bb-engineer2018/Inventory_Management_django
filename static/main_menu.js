document.addEventListener('DOMContentLoaded', () => {
    const mainMenuNav = document.getElementById('main-menu-nav');

    const menuItems = [
        { text: '物品マスタ', href: '/item-master/' },
        { text: '発注入力', href: '/order/' },
        { text: '注文・納品確認', href: '/order-delivery-confirmation/' },
        { text: '物品登録', href: '/register/' },
        { text: '削除済み物品', href: '/deleted/' },
        { text: 'Excelバックアップ', id: 'excel-backup-button' } // 新しいボタン
    ];

    menuItems.forEach(item => {
        const link = document.createElement('a');
        link.textContent = item.text;
        link.classList.add('menu-button');

        if (item.href) {
            link.href = item.href;
        } else if (item.id === 'excel-backup-button') {
            link.href = '#'; // クリックイベントで処理するため
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('Excelバックアップを実行しますか？')) {
                    try {
                        const response = await fetch('/api/trigger-excel-backup/', {
                            method: 'POST',
                            headers: { 'X-CSRFToken': getCookie('csrftoken') }
                        });
                        const data = await response.json();
                        if (response.ok) {
                            alert(data.message);
                        } else {
                            alert(`バックアップ失敗: ${data.message || response.statusText}`);
                        }
                    } catch (error) {
                        console.error('Excelバックアップエラー:', error);
                        alert('Excelバックアップ中にエラーが発生しました。');
                    }
                }
            });
        }
        mainMenuNav.appendChild(link);
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